import Anthropic from '@anthropic-ai/sdk'
import { getAnthropicApiKey } from './storage'

// Phase 1: the key lives in localStorage and calls go straight from the
// browser. In Phase 2 this moves behind a serverless endpoint.
export function hasApiKey() {
  return Boolean(getAnthropicApiKey())
}

export async function generateCaption(post) {
  const apiKey = getAnthropicApiKey()
  if (!apiKey) {
    throw new Error('No API key set')
  }

  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })

  const prompt = `You are a social media expert for a real estate agent.
Write a caption for a ${post.platform} ${post.postType ?? 'post'} post.
Post title: ${post.title || 'Untitled'}
Goal: ${post.postGoal || 'Not specified'}
Strategy: ${post.postStrategy || 'Not specified'}

Write in a warm, local, authentic voice. Keep it conversational.
End with a call to action. Include relevant emojis but don't overdo it.
Do not use hashtags — the user will add those themselves.
Return only the caption text, nothing else.`

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  })

  const textBlock = response.content.find((block) => block.type === 'text')
  return textBlock?.text.trim() ?? ''
}
