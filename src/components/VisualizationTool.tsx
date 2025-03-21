
import React, { useEffect, useRef, useState } from 'react';
import { VisualizationData } from '../types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { generateVisualization } from '../utils/api';
import AnimatedTransition from './AnimatedTransition';
import { toast } from '@/components/ui/use-toast';
import type { EChartsOption } from 'echarts';
import { useIsMobile } from '@/hooks/use-mobile';

// We'll use a dynamic import for Charts to avoid SSR issues
const EChartsReact = React.lazy(() => import('echarts-for-react'));

const visualizationTypes = [
  { value: 'supply-demand', label: '供需曲线' },
  { value: 'gdp-growth', label: 'GDP增长' },
  { value: 'inflation', label: '通货膨胀率' },
  { value: 'unemployment', label: '失业率' },
];

interface VisualizationToolProps {
  className?: string;
}

const VisualizationTool: React.FC<VisualizationToolProps> = ({ className }) => {
  const [selectedType, setSelectedType] = useState<string>('supply-demand');
  const [visualization, setVisualization] = useState<VisualizationData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const chartRef = useRef<any>(null);
  const isMobile = useIsMobile();

  const handleTypeChange = (value: string) => {
    setSelectedType(value);
  };

  const handleGenerateChart = async () => {
    setIsLoading(true);
    
    try {
      const response = await generateVisualization(selectedType, {});
      
      if (response.error) {
        toast({
          title: "生成可视化失败",
          description: response.error,
          variant: "destructive",
        });
      } else {
        setVisualization(response.data);
      }
    } catch (error) {
      console.error('Error generating visualization:', error);
      toast({
        title: "生成可视化失败",
        description: "无法生成图表，请稍后再试",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getChartOptions = (): EChartsOption => {
    if (!visualization) return {};
    
    return {
      title: {
        text: visualization.title,
        left: 'center',
        textStyle: {
          fontFamily: 'Inter, sans-serif',
          fontWeight: 500,
          fontSize: isMobile ? 14 : 16
        }
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        borderWidth: 1,
        borderColor: '#E0E0E5',
        textStyle: {
          color: '#333',
          fontFamily: 'Inter, sans-serif',
        },
        extraCssText: 'box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);',
      },
      legend: {
        data: visualization.series.map(item => item.name),
        bottom: 0,
        textStyle: {
          fontFamily: 'Inter, sans-serif',
          fontSize: isMobile ? 12 : 14
        },
        itemWidth: isMobile ? 12 : 25,
        itemHeight: isMobile ? 8 : 14
      },
      grid: {
        left: isMobile ? '8%' : '5%',
        right: isMobile ? '5%' : '5%',
        bottom: isMobile ? '20%' : '15%',
        top: isMobile ? '20%' : '15%',
        containLabel: true
      },
      xAxis: {
        type: 'category' as const,
        name: visualization.xAxis.title,
        nameLocation: 'middle',
        nameGap: isMobile ? 25 : 30,
        nameTextStyle: {
          fontSize: isMobile ? 12 : 14
        },
        data: visualization.xAxis.data,
        axisLine: {
          lineStyle: {
            color: '#E0E0E5'
          }
        },
        axisTick: {
          alignWithLabel: true
        },
        axisLabel: {
          fontSize: isMobile ? 10 : 12,
          interval: isMobile ? 'auto' : 0,
          rotate: isMobile ? 45 : 0
        }
      },
      yAxis: {
        type: 'value' as const,
        name: visualization.yAxis.title,
        nameLocation: 'middle',
        nameGap: isMobile ? 35 : 40,
        nameTextStyle: {
          fontSize: isMobile ? 12 : 14
        },
        axisLine: {
          lineStyle: {
            color: '#E0E0E5'
          }
        },
        splitLine: {
          lineStyle: {
            color: '#F5F5F7'
          }
        },
        axisLabel: {
          fontSize: isMobile ? 10 : 12
        }
      },
      series: visualization.series.map((series, index) => {
        // Map the series type to valid ECharts series type
        let seriesType: 'line' | 'bar' | 'scatter';
        
        // Convert 'area' type to 'line' with areaStyle
        if (series.type === 'area') {
          seriesType = 'line';
        } else if (series.type === 'bar' || series.type === 'scatter') {
          seriesType = series.type;
        } else {
          seriesType = 'line';
        }

        return {
          name: series.name,
          type: seriesType,
          data: series.data,
          smooth: true,
          // Add areaStyle for 'area' type
          ...(series.type === 'area' ? { 
            areaStyle: {
              opacity: 0.3
            } 
          } : {}),
          lineStyle: {
            width: isMobile ? 2 : 3,
            color: index === 0 ? '#0077CC' : '#FF6B6B'
          },
          itemStyle: {
            color: index === 0 ? '#0077CC' : '#FF6B6B'
          },
          symbolSize: isMobile ? 4 : 6
        };
      })
    };
  };

  return (
    <div className={cn("flex flex-col h-full rounded-2xl overflow-hidden glass-card", className)}>
      <div className="px-4 md:px-6 py-3 md:py-4 border-b">
        <h2 className="text-lg md:text-xl font-semibold">经济数据可视化</h2>
        <p className="text-xs md:text-sm text-muted-foreground">生成并探索经济图表</p>
      </div>
      
      <div className="p-3 md:p-6 space-y-4 md:space-y-6 flex-1">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4">
          <Select value={selectedType} onValueChange={handleTypeChange}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="选择图表类型" />
            </SelectTrigger>
            <SelectContent>
              {visualizationTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            onClick={handleGenerateChart} 
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading ? (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : '生成图表'}
          </Button>
        </div>
        
        <AnimatedTransition show={!!visualization} variant="blur" className="flex-1 flex items-center justify-center">
          {visualization && (
            <React.Suspense fallback={<div>加载图表中...</div>}>
              <EChartsReact
                ref={chartRef}
                option={getChartOptions()}
                style={{ height: '100%', width: '100%', minHeight: isMobile ? '250px' : '300px' }}
                className="w-full h-full"
                opts={{ renderer: 'canvas' }}
              />
            </React.Suspense>
          )}
        </AnimatedTransition>
        
        {!visualization && (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4 md:p-8">
            <div className="w-12 h-12 md:w-16 md:h-16 mb-4 rounded-full bg-econoGray-light flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 18L12 14M12 14L16 18M12 14V22M20.8 17.0399C22.1523 15.871 23 14.141 23 12.1941C23 8.73892 20.2822 5.99999 17 5.99999C16.7031 5.99999 16.4111 6.02305 16.1262 6.06756C15.1022 3.46489 12.7096 1.49999 10 1.49999C6.49746 1.49999 3.72836 4.29933 3.52442 7.90642C1.48693 8.91956 0 11.0254 0 13.5C0 17.0899 2.91015 20 6.5 20H7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="text-base md:text-lg font-medium mb-2">选择图表类型并生成</h3>
            <p className="text-xs md:text-sm text-muted-foreground max-w-md">
              选择您想要生成的经济数据图表类型，然后点击"生成图表"按钮查看2020-2030年的预测数据。
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VisualizationTool;
