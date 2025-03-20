
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
            content: '你是一个专业的经济学助手，擅长解释经济学概念、分析经济政策影响并提供相关洞见。你的回答应该简洁、清晰，并尽可能提供实际例子来帮助用户理解。请使用中文回答所有问题。尽量使用Markdown格式来组织你的回答，包括使用标题、列表、强调和引用等格式。'
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
    
    // Build a prompt based on visualization type
    let prompt = '';
    switch(type) {
      case 'supply-demand':
        prompt = '请生成一个2020年到2030年的供需曲线预测数据，包括价格和数量的关系。';
        break;
      case 'gdp-growth':
        prompt = '请生成一个2020年到2030年间中国GDP增长率的预测数据。提供每年的GDP增长率预测值。';
        break;
      case 'inflation':
        prompt = '请生成一个2020年到2030年间的通货膨胀率预测数据。提供每年的通货膨胀率预测值。';
        break;
      case 'unemployment':
        prompt = '请生成一个2020年到2030年间的失业率预测数据。提供每年的失业率预测值。';
        break;
      default:
        prompt = `请生成一个2020年到2030年间的${type}经济数据预测。`;
    }
    
    prompt += ' 请用JSON格式返回数据，包含年份和对应的数值。';
    
    // Call DeepSeek API for chart data
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
            content: '你是一个专业的经济数据分析师，擅长生成经济预测数据。请按照要求生成相应的数据集。所有返回必须是有效的JSON格式，不要有任何多余的说明文字。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3, // Lower temperature for more consistent outputs
        max_tokens: 1000,
      }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('DeepSeek API error:', data);
      throw new Error(data.error?.message || '请求API时出错');
    }
    
    const aiResponse = data.choices[0].message.content;
    
    // Try to extract JSON from the response
    const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/) || aiResponse.match(/```\n([\s\S]*?)\n```/) || aiResponse.match(/\{[\s\S]*\}/);
    
    let chartData;
    try {
      chartData = jsonMatch 
        ? JSON.parse(jsonMatch[1] || jsonMatch[0]) 
        : JSON.parse(aiResponse);
    } catch (error) {
      console.error('Failed to parse JSON from API response:', error);
      console.log('Raw response:', aiResponse);
      throw new Error('无法解析可视化数据');
    }
    
    // Process the data based on visualization type
    let visualizationData: VisualizationData;
    
    switch(type) {
      case 'supply-demand':
        visualizationData = processSupplyDemandData(chartData);
        break;
      case 'gdp-growth':
        visualizationData = processTimeSeriesData(chartData, 'GDP增长率', '%');
        break;
      case 'inflation':
        visualizationData = processTimeSeriesData(chartData, '通货膨胀率', '%');
        break;
      case 'unemployment':
        visualizationData = processTimeSeriesData(chartData, '失业率', '%');
        break;
      default:
        visualizationData = processTimeSeriesData(chartData, type, '');
    }
    
    return { data: visualizationData };
  } catch (error) {
    console.error('Error generating visualization:', error);
    return { 
      data: {
        type: 'error',
        title: '可视化生成失败',
        xAxis: {
          title: '年份',
          data: ['2020', '2021', '2022', '2023', '2024', '2025', '2026', '2027', '2028', '2029', '2030'],
        },
        yAxis: {
          title: '数值',
          data: [],
        },
        series: [{
          name: '错误',
          data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          type: 'line',
        }],
      }, 
      error: error instanceof Error ? error.message : '未知错误' 
    };
  }
}

// Helper functions to process visualization data
function processSupplyDemandData(data: any): VisualizationData {
  // Handle supply-demand curve data
  const years = Object.keys(data).sort() || ['2020', '2021', '2022', '2023', '2024', '2025', '2026', '2027', '2028', '2029', '2030'];
  
  // Extract supply and demand data
  const supplyData = years.map(year => data[year]?.supply || 0);
  const demandData = years.map(year => data[year]?.demand || 0);
  
  return {
    type: 'supply-demand',
    title: '2020-2030供需曲线预测',
    xAxis: {
      title: '年份',
      data: years,
    },
    yAxis: {
      title: '数量',
      data: [],
    },
    series: [
      {
        name: '供给',
        data: supplyData,
        type: 'line',
      },
      {
        name: '需求',
        data: demandData,
        type: 'line',
      },
    ],
  };
}

function processTimeSeriesData(data: any, title: string, unit: string): VisualizationData {
  let years: string[] = [];
  let values: number[] = [];
  
  // Handle different possible data formats
  if (Array.isArray(data)) {
    // If data is an array of objects with year/value properties
    data.forEach((item: any) => {
      if (item.year && (item.value !== undefined || item.rate !== undefined)) {
        years.push(item.year.toString());
        values.push(Number(item.value || item.rate || 0));
      }
    });
  } else if (typeof data === 'object') {
    // If data is an object with years as keys
    years = Object.keys(data).sort();
    values = years.map(year => {
      const value = data[year];
      return typeof value === 'object' ? Number(value.value || value.rate || 0) : Number(value || 0);
    });
  }
  
  // Default to 2020-2030 if no valid data was extracted
  if (years.length === 0) {
    years = ['2020', '2021', '2022', '2023', '2024', '2025', '2026', '2027', '2028', '2029', '2030'];
    values = [3.2, 3.5, 3.8, 4.0, 4.2, 4.1, 3.9, 3.7, 3.5, 3.3, 3.0]; // Default example values
  }
  
  return {
    type: 'time-series',
    title: `2020-2030${title}预测`,
    xAxis: {
      title: '年份',
      data: years,
    },
    yAxis: {
      title: `${title}(${unit})`,
      data: [],
    },
    series: [
      {
        name: title,
        data: values,
        type: 'area',
      },
    ],
  };
}
