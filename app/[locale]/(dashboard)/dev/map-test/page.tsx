import { notFound } from 'next/navigation'
import { EsriMapTestClient } from '@/components/dev/esri-map-test-client'

export const metadata = {
  title: 'Dev: Esri Map & Place Search Test | FarmerOS',
  robots: {
    index: false,
    follow: false,
  },
}

export default function DevMapTestPage() {
  // Hidden dev test route; returns 404 in production environments
  if (process.env.NODE_ENV === 'production') {
    notFound()
  }

  return <EsriMapTestClient />
}
