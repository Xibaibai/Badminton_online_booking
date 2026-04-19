import express from 'express';
import { FetchClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';

const router = express.Router();

router.get('/fetch-url', async (req, res) => {
  const { url } = req.query;
  
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'URL is required' });
  }
  
  try {
    const customHeaders = HeaderUtils.extractForwardHeaders(req.headers as Record<string, string>);
    const config = new Config();
    const client = new FetchClient(config, customHeaders);
    
    const response = await client.fetch(url);
    
    // 提取纯文本内容
    const textContent = response.content
      .filter(item => item.type === 'text')
      .map(item => item.text || '')
      .join('\n');
    
    return res.json({
      status_code: response.status_code,
      status_message: response.status_message,
      url: response.url,
      title: response.title,
      content: textContent,
      content_items: response.content
    });
  } catch (error) {
    console.error('Fetch URL error:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch URL',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
