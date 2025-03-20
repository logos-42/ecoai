import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import ChatInterface from '@/components/ChatInterface';
import PolicySimulator from '@/components/PolicySimulator';
import VisualizationTool from '@/components/VisualizationTool';
import ConceptCard from '@/components/ConceptCard';
import AnimatedTransition from '@/components/AnimatedTransition';
import { Button } from '@/components/ui/button';
import { EconomicConcept } from '@/types';

// Sample economic concepts in Chinese
const sampleConcepts: EconomicConcept[] = [{
  id: '1',
  title: '供需平衡',
  description: '供需平衡是指市场中商品或服务的供给量与需求量达到平衡状态，价格趋于稳定的过程。',
  examples: ['咖啡店根据客流量调整咖啡价格', '共享单车公司根据区域需求调整车辆投放', '农产品在不同季节的价格波动'],
  category: 'basic'
}, {
  id: '2',
  title: '边际效应',
  description: '边际效应指额外一单位投入（如劳动、资本）所带来的产出变化，是经济决策的重要依据。',
  examples: ['餐厅增加一名厨师对出餐效率的影响', '学习时间增加一小时对考试成绩的提升', '企业增加一单位广告投入对销售额的贡献'],
  category: 'intermediate'
}, {
  id: '3',
  title: '通货膨胀',
  description: '通货膨胀是指一般物价水平持续上涨，导致货币购买力下降的经济现象。',
  examples: ['各国央行通过调整利率控制通胀', '工资上涨速度低于物价上涨导致实际购买力下降', '投资者通过多元化资产配置应对通胀风险'],
  category: 'basic'
}, {
  id: '4',
  title: '博弈论',
  description: '博弈论研究多个参与者在策略互动情境中的决策行为和最优策略选择。',
  examples: ['企业定价策略中考虑竞争对手反应', '招聘中雇主与求职者的薪资谈判', '国际贸易谈判中各国的关税政策制定'],
  category: 'advanced'
}];
const Index = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    setIsLoaded(true);
  }, []);
  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    section?.scrollIntoView({
      behavior: 'smooth'
    });
  };
  return <div className="min-h-screen bg-gradient-to-b from-white to-econoGray-light">
      <Header />
      
      {/* Hero Section */}
      <section id="home" className="pt-28 pb-20 md:pt-40 md:pb-32 overflow-hidden">
        <div className="container-lg relative">
          <AnimatedTransition show={isLoaded} variant="slide-down" className="text-center max-w-4xl mx-auto">
            <div className="inline-block pill mb-4 animate-fade-in">基于DeepSeek的AI助手</div>
            <h1 className="text-display mb-6 tracking-tight leading-tight">
              通过<span className="highlight-text">AI</span>掌握<span className="highlight-text">经济学</span>
              的学习利器
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              从基础概念到复杂模型，让经济学学习变得简单易懂。通过交互式工具和生活化案例，轻松理解经济学原理。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={() => scrollToSection('features')} className="text-lg py-6 px-8 animated-gradient hover:shadow-elevated transition-all text-[#2a6c7c]">
                开始学习
              </Button>
              <Button variant="outline" className="text-lg py-6 px-8 bg-white/80 backdrop-blur hover:bg-white transition-all" onClick={() => scrollToSection('simulator')}>
                了解更多
              </Button>
            </div>
          </AnimatedTransition>
          
          <div className="absolute -z-10 inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-0 w-64 h-64 rounded-full bg-blue-100 blur-3xl opacity-40" />
            <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-blue-100 blur-3xl opacity-40" />
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container-lg">
          <div className="text-center mb-16">
            <div className="inline-block pill mb-4">核心功能</div>
            <h2 className="text-title mb-4">丰富的学习工具</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              通过多种交互式工具，帮助您深入理解经济学概念和理论，从理论到实践全方位掌握经济学知识。
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {sampleConcepts.map((concept, index) => <AnimatedTransition key={concept.id} show={isLoaded} variant="scale" delay={index * 100}>
                <ConceptCard concept={concept} />
              </AnimatedTransition>)}
          </div>
          <div className="mt-12 text-center">
            <Button className="text-lg py-3 px-6">
              浏览更多概念
            </Button>
          </div>
        </div>
      </section>
      
      {/* Chat Interface Section */}
      <section className="py-20 bg-econoGray-light">
        <div className="container-lg">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-block pill mb-4">智能问答</div>
              <h2 className="text-title mb-6">像对话导师一样学习经济学</h2>
              <p className="text-lg text-muted-foreground mb-8">
                通过自然语言对话，向AI助手提问任何经济学概念和理论。获得简明易懂、生活化的解释，让复杂理论变得简单。
              </p>
              <ul className="space-y-4">
                {['通过生活案例解释抽象概念', '提供启发式思考问题深化理解', '根据当前经济热点给出相关分析', '从初级到高级逐步深入学习'].map((item, index) => <li key={index} className="flex items-start gap-3">
                    <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-econoBlue-light flex items-center justify-center">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 3L4.5 8.5L2 6" stroke="#0077CC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <span>{item}</span>
                  </li>)}
              </ul>
              <div className="mt-8">
                <Button className="text-lg py-3 px-6">
                  开始对话
                </Button>
              </div>
            </div>
            
            <AnimatedTransition show={isLoaded} variant="slide-up" className="w-full h-[500px]">
              <ChatInterface className="h-full shadow-elevated" />
            </AnimatedTransition>
          </div>
        </div>
      </section>
      
      {/* Policy Simulator Section */}
      <section id="simulator" className="py-20 bg-white">
        <div className="container-lg">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <AnimatedTransition show={isLoaded} variant="slide-up" className="w-full h-[600px] order-2 lg:order-1">
              <PolicySimulator className="h-full shadow-elevated" />
            </AnimatedTransition>
            
            <div className="order-1 lg:order-2">
              <div className="inline-block pill mb-4">政策模拟</div>
              <h2 className="text-title mb-6">探索经济政策的影响机制</h2>
              <p className="text-lg text-muted-foreground mb-8">
                通过交互式政策模拟器，观察不同经济政策如何影响市场和经济指标。理解货币政策、财政政策和贸易政策的作用机制与效果。
              </p>
              <ul className="space-y-4">
                {['模拟利率变化对投资与消费的影响', '分析税率调整对企业决策的作用', '观察贸易政策对进出口的短期与长期效应', '基于历史案例提供参考与启示'].map((item, index) => <li key={index} className="flex items-start gap-3">
                    <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-econoBlue-light flex items-center justify-center">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 3L4.5 8.5L2 6" stroke="#0077CC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <span>{item}</span>
                  </li>)}
              </ul>
              <div className="mt-8">
                <Button className="text-lg py-3 px-6">
                  尝试模拟器
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Visualization Tool Section */}
      <section id="visualization" className="py-20 bg-econoGray-light">
        <div className="container-lg">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-block pill mb-4">数据可视化</div>
              <h2 className="text-title mb-6">直观理解经济数据关系</h2>
              <p className="text-lg text-muted-foreground mb-8">
                通过交互式图表，直观展现经济数据关系和变化趋势。从供需曲线到宏观经济指标，让复杂数据一目了然。
              </p>
              <ul className="space-y-4">
                {['动态生成标准经济学图表模型', '调整参数观察曲线变化规律', '展示宏观经济指标历史走势', '提供图表解读与经济含义分析'].map((item, index) => <li key={index} className="flex items-start gap-3">
                    <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-econoBlue-light flex items-center justify-center">
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 3L4.5 8.5L2 6" stroke="#0077CC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <span>{item}</span>
                  </li>)}
              </ul>
              <div className="mt-8">
                <Button className="text-lg py-3 px-6">
                  查看可视化工具
                </Button>
              </div>
            </div>
            
            <AnimatedTransition show={isLoaded} variant="slide-up" className="w-full h-[500px]">
              <VisualizationTool className="h-full shadow-elevated" />
            </AnimatedTransition>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="container-lg">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-block pill mb-4">立即开始</div>
            <h2 className="text-title mb-6">开始您的经济学学习之旅</h2>
            <p className="text-lg text-muted-foreground mb-8">
              无论您是经济学初学者还是希望深化理解的进阶学习者，经济小白AI都能提供量身定制的学习体验。
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button className="text-lg py-6 px-8 animated-gradient hover:shadow-elevated transition-all">
                免费开始使用
              </Button>
              <Button variant="outline" className="text-lg py-6 px-8">
                查看教程
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-12 bg-econoGray-light border-t border-border">
        <div className="container-lg">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <div className="w-6 h-6 relative">
                <img src="/lovable-uploads/d7fd4329-e420-4843-a666-9589c8c43b58.png" alt="经济小白AI" className="w-full h-full object-contain" />
              </div>
              <div className="font-semibold">经济小白AI</div>
            </div>
            
            <div className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} 经济小白AI. 基于DeepSeek API构建.
            </div>
          </div>
          <div className="mt-8 text-center text-sm text-muted-foreground">
            <p>DeepSeek API 密钥: sk-392a95fc7d2445f6b6c79c17725192d1</p>
          </div>
        </div>
      </footer>
    </div>;
};
export default Index;