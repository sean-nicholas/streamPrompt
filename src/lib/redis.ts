export const redisSubscribe = ({ key }: { key: string }) => {
  return fetch(`${process.env.REDIS_URL!}/subscribe/${key}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.REDIS_TOKEN}`,
      Accept: 'text/event-stream',
    },
  })
}

export const redisPublish = ({ key, data }: { key: string; data: string }) => {
  return fetch(`${process.env.REDIS_URL!}/publish/${key}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.REDIS_TOKEN}`,
    },
    body: JSON.stringify({ data }),
  })
}
