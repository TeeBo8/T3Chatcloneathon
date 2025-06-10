"use client"

import { useUser } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Progress } from "../ui/progress";
import { useEffect, useState } from "react";

export function UserInfoPanel() {
  const { user } = useUser();
  const [subscriptionData, setSubscriptionData] = useState({
    messageCount: 0,
    messageLimit: 20,
    messagesRemaining: 20,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSubscriptionData = async () => {
      try {
        const response = await fetch('/api/user/subscription');
        if (response.ok) {
          const data = await response.json();
          setSubscriptionData(data);
        }
      } catch (error) {
        console.error('Error fetching subscription data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchSubscriptionData();
    }

    // Rafraîchir les données toutes les 30 secondes
    const interval = setInterval(() => {
      if (user) {
        fetchSubscriptionData();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [user]);

  if (!user) return null;

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center space-y-2">
        <Avatar className="h-24 w-24">
          <AvatarImage src={user.imageUrl} />
          <AvatarFallback>{user.firstName?.[0]}{user.lastName?.[0]}</AvatarFallback>
        </Avatar>
        <h2 className="text-2xl font-bold">{user.fullName}</h2>
        <p className="text-muted-foreground">{user.primaryEmailAddress?.emailAddress}</p>
        <div className="px-3 py-1 text-sm font-semibold text-primary-foreground bg-primary rounded-full">
          Free Plan
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-md">Message Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Usage</span>
              <span className="text-muted-foreground">
                {isLoading ? "..." : `${subscriptionData.messageCount}/${subscriptionData.messageLimit}`}
              </span>
            </div>
            <Progress 
              value={isLoading ? 0 : (subscriptionData.messageCount / subscriptionData.messageLimit) * 100} 
              className="h-2" 
            />
            <p className="text-xs text-muted-foreground">
              {isLoading 
                ? "Loading..." 
                : `${subscriptionData.messagesRemaining} messages remaining this month`
              }
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 