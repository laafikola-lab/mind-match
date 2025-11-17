import Link from 'next/link'

export default function Home() {
  return (
    <div style={{ maxWidth: 640, margin: '40px auto', textAlign: 'center' }}>
      <h1>Mind Match</h1>
      <p>Welcome. Get started:</p>
      <div style={{ marginTop: 20 }}>
        <Link href="/login"><button style={{ marginRight: 8 }}>Login</button></Link>
        <Link href="/profile"><button>Profile</button></Link>
      </div>
    </div>
  )
}
