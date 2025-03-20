
import { Message, PolicySimulation, VisualizationData } from '../types';
import { DEEPSEEK_API_KEY } from '../config/constants';

const API_ENDPOINT = 'https://api.deepseek.com/v1';

interface ApiResponse<T> {
  data: T;
  error?: string;
}

export async function sendChatMessage(message: string): Promise<ApiResponse<Message>> {
  try {
    console.log('Sending message to DeepSeek API:', message);
    
    // Send request to DeepSeek API
    const response = await fetch(`${API_ENDPOINT}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: '你是一个专业的经济学助手，擅长解释经济学概念、分析经济政策影响并提供相关洞见。你的回答应该简洁、清晰，并尽可能提供实际例子来帮助用户理解。请使用中文回答所有问题。'
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('DeepSeek API error:', data);
      throw new Error(data.error?.message || '请求API时出错');
    }
    
    return { 
      data: {
        id: Date.now().toString(),
        content: data.choices[0].message.content,
        role: 'assistant',
        timestamp: new Date(),
      }
    };
  } catch (error) {
    console.error('Error sending chat message:', error);
    return { 
      data: {
        id: Date.now().toString(),
        content: '抱歉，连接服务器时出现问题。请稍后再试。',
        role: 'assistant',
        timestamp: new Date(),
      }, 
      error: error instanceof Error ? error.message : '未知错误' 
    };
  }
}

export async function simulatePolicy(policyType: string, params: Record<string, any>): Promise<ApiResponse<PolicySimulation>> {
  try {
    console.log('Simulating policy with params:', params);
    
    // Construct a prompt based on policy type and parameters
    let prompt = `我需要模拟一个${policyType === 'monetary' ? '货币政策' : policyType === 'fiscal' ? '财政政策' : '贸易政策'}的经济影响。`;
    
    if (policyType === 'monetary') {
      prompt += `基准利率设置为${params.interestRate}%。`;
    } else if (policyType === 'fiscal') {
      prompt += `税率设置为${params.taxRate}%。`;
    } else if (policyType === 'trade') {
      prompt += `关税率设置为${params.tariffRate}%。`;
    }
    
    prompt += "请分析该政策的短期、中期和长期经济影响，并提供相关的历史案例。请使用中文回答并使用清晰的结构。";
    
    // Call DeepSeek API
    const response = await fetch(`${API_ENDPOINT}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: '你是一个专业的经济政策分析师，擅长分析各类经济政策的影响。请根据提供的政策参数，分析其短期、中期和长期影响，并提供相关的历史案例。请使用中文回答，并使用清晰的结构分析影响。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('DeepSeek API error:', data);
      throw new Error(data.error?.message || '请求API时出错');
    }
    
    // Process the AI response to extract structured information
    const aiResponse = data.choices[0].message.content;
    
    // This is a simple processor - in a real app, you might use a more sophisticated
    // parsing approach or ask the API to return structured data
    const shortTermImpacts = extractImpacts(aiResponse, '短期');
    const mediumTermImpacts = extractImpacts(aiResponse, '中期');
    const longTermImpacts = extractImpacts(aiResponse, '长期');
    const historicalExamples = extractHistoricalExamples(aiResponse);
    
    let policyName = '';
    if (policyType === 'monetary') {
      policyName = `货币政策（利率 ${params.interestRate}%）`;
    } else if (policyType === 'fiscal') {
      policyName = `财政政策（税率 ${params.taxRate}%）`;
    } else if (policyType === 'trade') {
      policyName = `贸易政策（关税率 ${params.tariffRate}%）`;
    }
    
    return { 
      data: {
        id: Date.now().toString(),
        name: policyName,
        description: extractDescription(aiResponse),
        impactAreas: {
          shortTerm: shortTermImpacts,
          mediumTerm: mediumTermImpacts,
          longTerm: longTermImpacts,
        },
        historicalExamples: historicalExamples,
      }
    };
  } catch (error) {
    console.error('Error simulating policy:', error);
    return { 
      data: {
        id: Date.now().toString(),
        name: '模拟出错',
        description: '无法完成政策模拟',
        impactAreas: {
          shortTerm: ['无法获取短期影响'],
          mediumTerm: ['无法获取中期影响'],
          longTerm: ['无法获取长期影响'],
        },
        historicalExamples: [{
          year: 0,
          country: '无数据',
          outcome: '无法获取历史案例'
        }],
      }, 
      error: error instanceof Error ? error.message : '未知错误' 
    };
  }
}

// Helper functions to parse AI response
function extractImpacts(text: string, timeframe: string): string[] {
  const impacts: string[] = [];
  
  try {
    // Simple regex-based extraction - this could be improved
    const regex = new RegExp(`${timeframe}[^\\n]*\\n([\\s\\S]*?)(?=\\n\\n|$)`, 'i');
    const match = text.match(regex);
    
    if (match && match[1]) {
      const impactText = match[1].trim();
      const bulletPoints = impactText.split(/\n\s*[-•*]\s*/);
      
      bulletPoints.forEach(point => {
        const trimmed = point.trim();
        if (trimmed && !trimmed.startsWith(timeframe)) {
          impacts.push(trimmed);
        }
      });
    }
    
    // If we couldn't extract anything, provide default responses
    if (impacts.length === 0) {
      if (timeframe === '短期') {
        impacts.push('消费者支出变化');
        impacts.push('市场利率调整');
      } else if (timeframe === '中期') {
        impacts.push('通货膨胀水平变化');
        impacts.push('商业投资调整');
      } else {
        impacts.push('经济增长潜力变化');
        impacts.push('货币价值波动');
      }
    }
  } catch (error) {
    console.error(`Error extracting ${timeframe} impacts:`, error);
    impacts.push(`无法解析${timeframe}影响`);
  }
  
  return impacts;
}

function extractHistoricalExamples(text: string): Array<{year: number, country: string, outcome: string}> {
  const examples: Array<{year: number, country: string, outcome: string}> = [];
  
  try {
    // Look for a section about historical examples
    const exampleSection = text.match(/历史案例[：:]\s*([\s\S]*?)(?=\n\n|$)/i);
    
    if (exampleSection && exampleSection[1]) {
      const exampleText = exampleSection[1].trim();
      const exampleLines = exampleText.split('\n');
      
      exampleLines.forEach(line => {
        // Try to extract year, country, and outcome
        const yearMatch = line.match(/(\d{4})/);
        const countryMatch = line.match(/(\d{4}[年份]*)([^，。,.]*)/) || line.match(/([^，。,.]*国[^，。,.]*)/);
        
        if (yearMatch && line.trim().length > 5) {
          const year = parseInt(yearMatch[1]);
          const country = countryMatch ? countryMatch[2].trim() : '全球';
          const outcome = line.replace(/\d{4}[年份]*/, '').replace(country, '').trim();
          
          examples.push({
            year,
            country,
            outcome
          });
        }
      });
    }
    
    // If we couldn't extract examples, provide defaults
    if (examples.length === 0) {
      examples.push({
        year: 2008,
        country: '美国',
        outcome: '量化宽松政策帮助稳定金融危机后的市场'
      });
      examples.push({
        year: 1997,
        country: '日本',
        outcome: '零利率政策导致流动性陷阱'
      });
    }
  } catch (error) {
    console.error('Error extracting historical examples:', error);
    examples.push({
      year: 0, 
      country: '数据解析错误',
      outcome: '无法获取历史案例'
    });
  }
  
  return examples;
}

function extractDescription(text: string): string {
  // Try to extract a summary or description from the first part of the response
  const firstParagraph = text.split('\n\n')[0].trim();
  
  if (firstParagraph && firstParagraph.length > 20) {
    return firstParagraph;
  }
  
  return '该政策模拟基于提供的参数，分析了可能的经济影响和历史案例。';
}

export async function generateVisualization(type: string, params: Record<string, any>): Promise<ApiResponse<VisualizationData>> {
  try {
    console.log('Generating visualization with params:', params);
    
    // Simulate API response with a supply-demand curve
    const response: VisualizationData = {
      type: 'supply-demand',
      title: '供需曲线',
      xAxis: {
        title: '数量',
        data: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      },
      yAxis: {
        title: '价格',
        data: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
      },
      series: [
        {
          name: '供给',
          data: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
          type: 'line',
        },
        {
          name: '需求',
          data: [11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1],
          type: 'line',
        },
      ],
    };
    
    return { data: response };
  } catch (error) {
    console.error('Error generating visualization:', error);
    return { 
      data: {
        type: 'custom',
        title: '可视化错误',
        xAxis: {
          title: '',
          data: [],
        },
        yAxis: {
          title: '',
          data: [],
        },
        series: [],
      }, 
      error: error instanceof Error ? error.message : '未知错误' 
    };
  }
}
