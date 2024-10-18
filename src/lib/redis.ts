export const redisSubscribe = ({ key }: { key: string }) => {
  const url = `${process.env.REDIS_URL!}/subscribe/${key}`
  console.log(url)
  return fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.REDIS_TOKEN}`,
      Accept: 'text/event-stream',
    },
  })
}

export const redisPublish = ({ key, data }: { key: string; data: string }) => {
  const url = `${process.env.REDIS_URL!}/publish/${key}`
  console.log(url)
  return fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.REDIS_TOKEN}`,
    },
    body: JSON.stringify({ data }),
  })
}
