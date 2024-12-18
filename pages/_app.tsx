import { type AppType } from "next/dist/shared/lib/utils"
import { Inter } from 'next/font/google'
import ErrorBoundary from '../components/ErrorBoundary'
import '../styles/globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ErrorBoundary>
      <main className={`${inter.variable} font-sans`}>
        <Component {...pageProps} />
      </main>
    </ErrorBoundary>
  )
}

export default MyApp