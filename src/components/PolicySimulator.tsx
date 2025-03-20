
import React, { useState } from 'react';
import { PolicySimulation } from '../types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { simulatePolicy } from '../utils/api';
import AnimatedTransition from './AnimatedTransition';
import { toast } from '@/components/ui/use-toast';
import { Label } from '@/components/ui/label';
import { useIsMobile } from '@/hooks/use-mobile';
import Markdown from './Markdown';

const policyTypes = [
  { value: 'monetary', label: '货币政策' },
  { value: 'fiscal', label: '财政政策' },
  { value: 'trade', label: '贸易政策' },
];

interface PolicySimulatorProps {
  className?: string;
}

const PolicySimulator: React.FC<PolicySimulatorProps> = ({ className }) => {
  const [policyType, setPolicyType] = useState<string>('monetary');
  const [interestRate, setInterestRate] = useState<number>(3);
  const [taxRate, setTaxRate] = useState<number>(15);
  const [tariffRate, setTariffRate] = useState<number>(10);
  const [simulationResult, setSimulationResult] = useState<PolicySimulation | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const isMobile = useIsMobile();

  const handleRunSimulation = async () => {
    setIsLoading(true);
    
    const params: Record<string, any> = {};
    
    switch (policyType) {
      case 'monetary':
        params.interestRate = interestRate;
        break;
      case 'fiscal':
        params.taxRate = taxRate;
        break;
      case 'trade':
        params.tariffRate = tariffRate;
        break;
    }
    
    try {
      const response = await simulatePolicy(policyType, params);
      
      if (response.error) {
        toast({
          title: "模拟失败",
          description: response.error,
          variant: "destructive",
        });
      } else {
        setSimulationResult(response.data);
        
        toast({
          title: "模拟完成",
          description: "政策模拟已成功生成",
        });
      }
    } catch (error) {
      console.error('Error running simulation:', error);
      toast({
        title: "模拟失败",
        description: "无法完成政策模拟，请稍后再试",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderParamControls = () => {
    switch (policyType) {
      case 'monetary':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="interest-rate">基准利率 ({interestRate}%)</Label>
                <span className="text-xs md:text-sm text-muted-foreground">{interestRate}%</span>
              </div>
              <Slider
                id="interest-rate"
                value={[interestRate]}
                min={0}
                max={10}
                step={0.25}
                onValueChange={(value) => setInterestRate(value[0])}
              />
            </div>
          </div>
        );
      case 'fiscal':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="tax-rate">税率 ({taxRate}%)</Label>
                <span className="text-xs md:text-sm text-muted-foreground">{taxRate}%</span>
              </div>
              <Slider
                id="tax-rate"
                value={[taxRate]}
                min={0}
                max={40}
                step={1}
                onValueChange={(value) => setTaxRate(value[0])}
              />
            </div>
          </div>
        );
      case 'trade':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="tariff-rate">关税率 ({tariffRate}%)</Label>
                <span className="text-xs md:text-sm text-muted-foreground">{tariffRate}%</span>
              </div>
              <Slider
                id="tariff-rate"
                value={[tariffRate]}
                min={0}
                max={30}
                step={1}
                onValueChange={(value) => setTariffRate(value[0])}
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const ImpactCard = ({ title, items }: { title: string; items: string[] }) => (
    <div className="rounded-lg bg-white/50 p-3 md:p-4 border border-border">
      <h4 className="font-semibold mb-2 text-sm md:text-base">{title}</h4>
      <ul className="space-y-1">
        {items.map((item, index) => (
          <li key={index} className="text-xs md:text-sm flex items-start gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-econoBlue mt-1.5" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className={cn("flex flex-col h-full rounded-2xl overflow-hidden glass-card", className)}>
      <div className="px-4 md:px-6 py-3 md:py-4 border-b">
        <h2 className="text-lg md:text-xl font-semibold">政策模拟器</h2>
        <p className="text-xs md:text-sm text-muted-foreground">模拟不同经济政策的影响</p>
      </div>
      
      <div className="p-3 md:p-6 space-y-4 md:space-y-6 flex-1 overflow-y-auto">
        <Tabs value={policyType} onValueChange={setPolicyType} className="w-full">
          <TabsList className="grid grid-cols-3 w-full">
            {policyTypes.map((type) => (
              <TabsTrigger key={type.value} value={type.value} className="text-xs md:text-sm">
                {type.label}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {policyTypes.map((type) => (
            <TabsContent key={type.value} value={type.value} className="space-y-4 md:space-y-6 mt-4 md:mt-6">
              {renderParamControls()}
            </TabsContent>
          ))}
        </Tabs>
        
        <Button 
          onClick={handleRunSimulation} 
          className="w-full" 
          disabled={isLoading}
          size={isMobile ? "sm" : "default"}
        >
          {isLoading ? (
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              运行模拟中...
            </div>
          ) : '运行模拟'}
        </Button>
        
        <AnimatedTransition show={!!simulationResult} variant="slide-up" className="space-y-4 md:space-y-6">
          {simulationResult && (
            <div className="space-y-4 md:space-y-6">
              <h3 className="text-base md:text-lg font-semibold">{simulationResult.name}</h3>
              <Markdown content={simulationResult.description} className="text-xs md:text-sm text-muted-foreground" />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                <ImpactCard title="短期影响" items={simulationResult.impactAreas.shortTerm} />
                <ImpactCard title="中期影响" items={simulationResult.impactAreas.mediumTerm} />
                <ImpactCard title="长期影响" items={simulationResult.impactAreas.longTerm} />
              </div>
              
              <div className="mt-4 md:mt-6">
                <h4 className="font-semibold mb-3 md:mb-4 text-sm md:text-base">历史案例参考</h4>
                <div className="space-y-2 md:space-y-3">
                  {simulationResult.historicalExamples.map((example, index) => (
                    <div key={index} className="flex items-start gap-3 p-2 md:p-3 rounded-lg bg-white/50 border border-border">
                      <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full bg-econoBlue-light flex items-center justify-center text-econoBlue font-semibold text-xs md:text-sm">
                        {example.year}
                      </div>
                      <div>
                        <div className="font-medium text-xs md:text-sm">{example.country}</div>
                        <div className="text-xs text-muted-foreground">{example.outcome}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </AnimatedTransition>
        
        {!simulationResult && !isLoading && (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-4 md:p-8">
            <div className="w-12 h-12 md:w-16 md:h-16 mb-4 rounded-full bg-econoGray-light flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M12 7V12L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="text-base md:text-lg font-medium mb-2">调整参数并运行模拟</h3>
            <p className="text-xs md:text-sm text-muted-foreground max-w-md">
              通过调整上方的参数设置不同的政策情景，然后点击"运行模拟"按钮查看模拟结果。
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PolicySimulator;
