from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Optional, Dict, Union
import pandas as pd
import json
import logging
from fastapi.responses import JSONResponse

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="CopyTrading Analytics API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load data from CSV
def load_wallet_data():
    try:
        df = pd.read_csv('wallet_data.csv')
        # Convert JSON strings to dictionaries
        df['token_metrics'] = df['token_metrics'].apply(lambda x: json.loads(x) if pd.notnull(x) else [])
        df['risk_metrics'] = df['risk_metrics'].apply(lambda x: json.loads(x) if pd.notnull(x) else {})
        return df
    except Exception as e:
        logger.error(f"Error loading CSV: {e}")
        return pd.DataFrame()

def calculate_wallet_scores(row):
    try:
        risk_metrics = row['risk_metrics']
        token_metrics = row['token_metrics']
        
        roi_score = min(max(row['roi_percentage'] / 100, 0), 1) * 100
        consistency = float(row['consistency_score']) if pd.notnull(row['consistency_score']) else 50.0
        volume_score = min(row['total_volume'] / 100000, 1) * 100
        trade_score = min(row['total_trades'] / 200, 1) * 100
        
        total_score = (
            roi_score * 0.3 +
            consistency * 0.3 +
            volume_score * 0.2 +
            trade_score * 0.2
        )
        
        return {
            "total_score": round(total_score, 2),
            "roi_score": round(roi_score, 2),
            "consistency_score": round(consistency, 2),
            "volume_score": round(volume_score, 2),
            "risk_score": round(100 - (risk_metrics.get('max_drawdown', 0) or 0), 2),
            "risk_metrics": risk_metrics,
            "token_stats": token_metrics
        }
    except Exception as e:
        logger.error(f"Error calculating wallet scores: {e}")
        return {
            "total_score": 0,
            "roi_score": 0,
            "consistency_score": 0,
            "volume_score": 0,
            "risk_score": 0,
            "risk_metrics": {},
            "token_stats": []
        }

@app.get("/wallets/top")
async def get_top_wallets(
    min_roi: float = Query(0.0, ge=0),
    min_win_rate: float = Query(0.0, ge=0, le=100),
    min_trades: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100)
):
    try:
        df = load_wallet_data()
        
        # Apply filters
        filtered_df = df[
            (df['roi_percentage'] >= min_roi) &
            (df['winrate'] >= min_win_rate) &
            (df['total_trades'] >= min_trades)
        ]
        
        wallets = []
        for _, row in filtered_df.iterrows():
            scores = calculate_wallet_scores(row)
            wallet = {
                "address": row['wallet_address'],
                "total_score": scores['total_score'],
                "roi_score": scores['roi_score'],
                "consistency_score": scores['consistency_score'],
                "volume_score": scores['volume_score'],
                "risk_score": scores['risk_score'],
                "trade_count": int(row['total_trades']),
                "win_rate": float(row['winrate']),
                "avg_profit": float(row['total_pnl_usd']) / float(row['total_trades']) if row['total_trades'] > 0 else 0,
                "max_drawdown": scores['risk_metrics'].get('max_drawdown', 0),
                "sharpe_ratio": scores['risk_metrics'].get('sharpe_ratio', 0),
                "token_stats": scores['token_stats'],
                "risk_metrics": scores['risk_metrics']
            }
            wallets.append(wallet)
            
        # Sort by total score and limit results
        wallets = sorted(wallets, key=lambda x: x['total_score'], reverse=True)[:limit]
        return wallets
        
    except Exception as e:
        logger.error(f"Error in get_top_wallets: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/stats/overview")
async def get_system_stats():
    try:
        df = load_wallet_data()
        
        # Calculate basic stats
        stats = {
            "total_wallets": len(df),
            "average_roi": float(df['roi_percentage'].mean()),
            "average_winrate": float(df['winrate'].mean()),
            "top_performers": len(df[(df['roi_percentage'] > 50) & (df['winrate'] > 60)]),
            "trends": [{
                "roi_change": 0,  # Simplified for CSV version
                "winrate_change": 0,
                "wallet_count_change": 0,
                "top_performers_change": 0
            }]
        }
        
        return stats
        
    except Exception as e:
        logger.error(f"Error in get_system_stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")