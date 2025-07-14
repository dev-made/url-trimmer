import { describe, it, expect, vi } from 'vitest'
// import axios from 'axios'

describe('Test http://localhost:3000/shorten', () => {
  it.sequential('returns short url with alias http://localhost:3000/goto3205', async () => {
    const shortLinkData = {
      originalUrl: 'https://3205.team',
      alias: 'goto3205',
    }

    // delete link if already exists
    const shortLink = 'goto3205'
    await fetch(`http://backend:3000/delete/${shortLink}`, {
      method: 'DELETE',
    })
    const { status, ok, text } = await fetch('http://backend:3000/shorten', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(shortLinkData),
    })

    expect(ok).toBe(true)
    expect(status).toBe(201)
    expect(text.length).toBeLessThanOrEqual(20)
  })

  it.sequential('visit page https://3205.team via redirect from nestjs server', async () => {
    const shortLink = 'goto3205'

    const { status, ok, url } = await fetch(`http://backend:3000/${shortLink}`, {
      method: 'GET',
    })

    expect(ok).toBe(true)
    expect(status).toBe(200)
    expect(url).toBe('https://3205.team/')
  })
})
