import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  TrendingUp, 
  MapPin, 
  Bell, 
  Award,
  ArrowUpRight,
  Info,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface StatCard {
  id: string;
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ElementType;
  color: string;
  route?: string;
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  tooltip?: string;
  alert?: {
    type: 'info' | 'warning' | 'success';
    message: string;
  };
}

interface SmartStatsCardsProps {
  userProfile?: {
    hasCompletedQuiz: boolean;
    profileCompleteness: number;
    lastActivity: Date;
  };
}

const SmartStatsCards = ({ userProfile }: SmartStatsCardsProps) => {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  // Dynamic stats based on user state
  const getStatsCards = (): StatCard[] => {
    const baseStats: StatCard[] = [
      {
        id: 'matches',
        title: 'Stream Matches',
        value: userProfile?.hasCompletedQuiz ? 12 : 0,
        subtitle: userProfile?.hasCompletedQuiz ? 'Based on your quiz' : 'Take quiz to see matches',
        icon: TrendingUp,
        color: 'text-blue-600',
        route: userProfile?.hasCompletedQuiz ? '/stream-recommendations' : '/quiz',
        priority: userProfile?.hasCompletedQuiz ? 'medium' : 'high',
        actionable: true,
        trend: 'up',
        trendValue: '+3 this week',
        tooltip: userProfile?.hasCompletedQuiz 
          ? 'Your personalized career stream recommendations'
          : 'Complete the aptitude quiz to discover your ideal career streams',
        alert: !userProfile?.hasCompletedQuiz ? {
          type: 'info',
          message: 'Take the quiz first!'
        } : undefined
      },
      {
        id: 'colleges',
        title: 'Nearby Colleges',
        value: 24,
        subtitle: 'Within 50km radius',
        icon: MapPin,
        color: 'text-green-600',
        route: '/nearby-colleges-map',
        priority: 'medium',
        actionable: true,
        tooltip: 'Government and private colleges in your area with admission details'
      },
      {
        id: 'notifications',
        title: 'Updates',
        value: 3,
        subtitle: 'New notifications',
        icon: Bell,
        color: 'text-orange-600',
        route: '/notifications',
        priority: 'low',
        actionable: true,
        tooltip: 'Important deadlines, scholarship alerts, and admission updates',
        alert: {
          type: 'warning',
          message: 'Admission deadline approaching!'
        }
      },
      {
        id: 'scholarships',
        title: 'Scholarships',
        value: 20,
        subtitle: 'Available opportunities',
        icon: Award,
        color: 'text-purple-600',
        route: '/scholarships',
        priority: 'medium',
        actionable: true,
        trend: 'up',
        trendValue: '+5 this month',
        tooltip: 'Explore scholarships based on your profile and eligibility',
        alert: {
          type: 'info',
          message: 'New scholarships added!'
        }
      }
    ];

    // Sort by priority and actionable status
    return baseStats.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      if (a.priority !== b.priority) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return a.actionable === b.actionable ? 0 : a.actionable ? -1 : 1;
    });
  };

  const statsCards = getStatsCards();

  const getCardStyles = (card: StatCard, isHovered: boolean) => {
    const baseStyles = "cursor-pointer transition-all duration-300 relative overflow-hidden";
    
    if (card.priority === 'high') {
      return `${baseStyles} ring-2 ring-blue-200 border-blue-300 ${isHovered ? 'shadow-lg scale-105' : 'shadow-md'}`;
    }
    
    if (card.actionable) {
      return `${baseStyles} border-primary/20 ${isHovered ? 'shadow-lg border-primary/40' : 'hover:shadow-md'}`;
    }
    
    return `${baseStyles} ${isHovered ? 'shadow-md' : ''}`;
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertCircle className="h-3 w-3" />;
      case 'success': return <CheckCircle className="h-3 w-3" />;
      default: return <Info className="h-3 w-3" />;
    }
  };

  const getAlertStyles = (type: string) => {
    switch (type) {
      case 'warning': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'success': return 'bg-green-50 text-green-700 border-green-200';
      default: return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  return (
    <TooltipProvider>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statsCards.map((card) => {
          const isHovered = hoveredCard === card.id;
          
          return (
            <Tooltip key={card.id}>
              <TooltipTrigger asChild>
                <Card 
                  className={getCardStyles(card, isHovered)}
                  onClick={() => card.route && navigate(card.route)}
                  onMouseEnter={() => setHoveredCard(card.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  {/* Priority indicator */}
                  {card.priority === 'high' && (
                    <div className="absolute top-0 right-0 w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] border-t-red-500">
                      <div className="absolute -top-4 -right-1 text-white text-xs font-bold transform rotate-45">
                        !
                      </div>
                    </div>
                  )}

                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {card.title}
                    </CardTitle>
                    <card.icon className={`h-4 w-4 ${card.color}`} />
                  </CardHeader>

                  <CardContent className="space-y-3">
                    <div className="flex items-baseline justify-between">
                      <div className="text-2xl font-bold text-foreground">
                        {card.value}
                      </div>
                      {card.actionable && (
                        <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">
                        {card.subtitle}
                      </p>

                      {/* Trend indicator */}
                      {card.trend && card.trendValue && (
                        <div className="flex items-center gap-1 text-xs">
                          <TrendingUp className={`h-3 w-3 ${
                            card.trend === 'up' ? 'text-green-500' : 
                            card.trend === 'down' ? 'text-red-500 rotate-180' : 
                            'text-gray-500'
                          }`} />
                          <span className="text-muted-foreground">{card.trendValue}</span>
                        </div>
                      )}

                      {/* Progress bar for profile completion */}

                      {/* Alert message */}
                      {card.alert && (
                        <div className={`
                          flex items-center gap-1 px-2 py-1 rounded text-xs border
                          ${getAlertStyles(card.alert.type)}
                        `}>
                          {getAlertIcon(card.alert.type)}
                          <span>{card.alert.message}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TooltipTrigger>
              
              {card.tooltip && (
                <TooltipContent>
                  <p className="max-w-xs">{card.tooltip}</p>
                </TooltipContent>
              )}
            </Tooltip>
          );
        })}
      </div>
    </TooltipProvider>
  );
};

export default SmartStatsCards;