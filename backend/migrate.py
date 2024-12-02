import psycopg2
from psycopg2.extras import RealDictCursor
import os
from dotenv import load_dotenv
import logging
import time
from io import StringIO
import csv

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Database connection details
SOURCE_DB_URL = "postgresql://postgres:Invis0704@localhost:5432/wallet_analyzer"
NEON_DB_URL = "postgres://neondb_owner:Q9kuSbpPETA6@ep-summer-fire-a2aq24xx-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require"

# Batch size for processing
BATCH_SIZE = 1000

def test_connection(connection_url, db_type):
    """Test database connection and print status"""
    try:
        conn = psycopg2.connect(connection_url)
        logger.info(f"✅ Successfully connected to {db_type} database")
        return conn
    except Exception as e:
        logger.error(f"❌ Failed to connect to {db_type} database: {str(e)}")
        raise

def format_value(value):
    """Format value for SQL insertion, handling NULLs and special characters"""
    if value is None:
        return 'NULL'
    elif isinstance(value, (int, float)):
        return str(value)
    elif isinstance(value, bool):
        return 'true' if value else 'false'
    else:
        # Escape single quotes and handle special characters
        return "'" + str(value).replace("'", "''") + "'"
def migrate_table(source_cur, dest_cur, table_name):
    """Migrate a single table using batched INSERT statements"""
    try:
        logger.info(f"Starting migration of table: {table_name}")
        
        # Get table schema
        logger.info(f"Fetching schema for table {table_name}...")
        source_cur.execute(f"""
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = '{table_name}'
            ORDER BY ordinal_position
        """)
        columns = source_cur.fetchall()
        logger.info(f"Found {len(columns)} columns in {table_name}")
        
        # Create table in destination
        create_table_sql = f"CREATE TABLE IF NOT EXISTS {table_name} ("
        column_defs = []
        for col_name, col_type, is_nullable in columns:
            nullable = "NULL" if is_nullable == "YES" else "NOT NULL"
            column_defs.append(f"{col_name} {col_type} {nullable}")
        create_table_sql += ", ".join(column_defs)
        create_table_sql += ")"
        
        logger.info(f"Creating table {table_name} in Neon if it doesn't exist...")
        dest_cur.execute(create_table_sql)
        
        # Get total count
        source_cur.execute(f"SELECT COUNT(*) FROM {table_name}")
        total_rows = source_cur.fetchone()[0]
        
        if total_rows > 0:
            logger.info(f"Found {total_rows} rows to migrate")
            
            # Get column names
            column_names = [col[0] for col in columns]
            
            # Process in batches
            offset = 0
            while offset < total_rows:
                # Fetch batch of rows
                source_cur.execute(f"""
                    SELECT {','.join(column_names)}
                    FROM {table_name}
                    OFFSET {offset}
                    LIMIT {BATCH_SIZE}
                """)
                rows = source_cur.fetchall()
                
                if not rows:
                    break
                
                # Build INSERT statement
                values_list = []
                for row in rows:
                    # Format each value in the row
                    formatted_values = [format_value(val) for val in row]
                    values_list.append(f"({','.join(formatted_values)})")
                
                # Execute batch insert
                insert_sql = f"""
                    INSERT INTO {table_name} ({','.join(column_names)})
                    VALUES {','.join(values_list)}
                """
                dest_cur.execute(insert_sql)
                
                offset += len(rows)
                progress = min(100, (offset / total_rows) * 100)
                logger.info(f"Progress: {progress:.1f}% ({offset}/{total_rows} rows)")
            
            logger.info(f"✅ Successfully migrated {total_rows} rows from {table_name}")
        else:
            logger.info(f"⚠️ No data found in table {table_name}")
        
    except Exception as e:
        logger.error(f"❌ Error migrating table {table_name}: {str(e)}")
        raise

def main():
    start_time = time.time()
    logger.info("Starting database migration process...")
    
    try:
        # Connect to source database
        logger.info("Establishing connection to PostgreSQL source database...")
        source_conn = test_connection(SOURCE_DB_URL, "PostgreSQL")
        source_cur = source_conn.cursor()
        
        # Connect to Neon database
        logger.info("Establishing connection to Neon destination database...")
        dest_conn = test_connection(NEON_DB_URL, "Neon")
        dest_cur = dest_conn.cursor()
        
        # Get list of tables
        logger.info("Fetching list of tables from source database...")
        source_cur.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name
        """)
        tables = [row[0] for row in source_cur.fetchall()]
        logger.info(f"Found {len(tables)} tables to migrate: {', '.join(tables)}")
        
        # Migrate each table
        for i, table in enumerate(tables, 1):
            table_start_time = time.time()
            logger.info(f"\nMigrating table {i} of {len(tables)}: {table}")
            
            try:
                migrate_table(source_cur, dest_cur, table)
                dest_conn.commit()
                table_time = time.time() - table_start_time
                logger.info(f"Table {table} migration completed in {table_time:.2f} seconds")
            except Exception as e:
                logger.error(f"Failed to migrate table {table}: {str(e)}")
                dest_conn.rollback()
                logger.info(f"Rolled back changes for table {table}")
                # Continue with next table instead of stopping completely
                continue
        
        elapsed_time = time.time() - start_time
        logger.info(f"\n✅ Migration completed in {elapsed_time:.2f} seconds")
        
    except Exception as e:
        logger.error(f"\n❌ Migration failed: {str(e)}")
        if 'dest_conn' in locals():
            dest_conn.rollback()
            logger.info("Rolled back any pending changes")
    finally:
        logger.info("\nClosing database connections...")
        if 'source_cur' in locals():
            source_cur.close()
        if 'source_conn' in locals():
            source_conn.close()
        if 'dest_cur' in locals():
            dest_cur.close()
        if 'dest_conn' in locals():
            dest_conn.close()
        logger.info("All database connections closed")

if __name__ == "__main__":
    print("\n=== Database Migration Tool ===\n")
    main()
    print("\n=== Migration Process Complete ===\n")