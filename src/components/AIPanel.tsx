import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { aiInsights } from '../lib/mockData';

export function AIPanel() {
    const [currentInsightIndex, setCurrentInsightIndex] = useState(0);
    const [displayedText, setDisplayedText] = useState('');
    const [isTyping, setIsTyping] = useState(true);

    useEffect(() => {
        if (currentInsightIndex >= aiInsights.length) return;

        const fullText = aiInsights[currentInsightIndex];
        let charIndex = 0;
        setIsTyping(true);

        const typingInterval = setInterval(() => {
            setDisplayedText(fullText.slice(0, charIndex + 1));
            charIndex++;
            if (charIndex === fullText.length) {
                clearInterval(typingInterval);
                setIsTyping(false);
                if (currentInsightIndex < aiInsights.length - 1) {
                    setTimeout(() => {
                        setCurrentInsightIndex(prev => prev + 1);
                        setDisplayedText('');
                    }, 2000);
                }
            }
        }, 40);

        return () => clearInterval(typingInterval);
    }, [currentInsightIndex]);

    return (
        <Card className="border-indigo-500/20 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 relative overflow-hidden group shadow-lg shadow-indigo-500/5">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-[40px] pointer-events-none" />
            <CardHeader className="pb-3 border-b border-border/40 bg-card/40 backdrop-blur-sm">
                <CardTitle className="flex items-center gap-2 text-indigo-500 dark:text-indigo-400 text-sm font-bold uppercase tracking-wider">
                    <Sparkles className="w-4 h-4" />
                    Wizard Intelligence
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 min-h-[160px] flex flex-col justify-center">
                <div className="space-y-4">
                    <div className="flex gap-3 items-start">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-md">
                            <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <div className="bg-card/70 backdrop-blur-md p-4 rounded-2xl rounded-tl-none border border-indigo-500/10 text-sm leading-relaxed shadow-sm w-full transition-all">
                            <div className="font-medium text-foreground">
                                {displayedText}
                                {isTyping && <span className="ml-1 inline-block w-1.5 h-4 bg-indigo-500 animate-pulse align-middle" />}
                            </div>
                        </div>
                    </div>

                    {currentInsightIndex === aiInsights.length - 1 && !isTyping && (
                        <div className="flex gap-2 justify-end animate-in slide-in-from-bottom-2 fade-in duration-500">
                            <div className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs px-3 py-1.5 rounded-full font-medium border border-indigo-500/20 flex items-center gap-1 shadow-sm">
                                <Sparkles className="w-3 h-3" />
                                Optimization Score: 94/100
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
