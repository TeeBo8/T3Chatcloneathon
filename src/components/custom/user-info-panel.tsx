"use client"

import { useUser } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Progress } from "../ui/progress";

export function UserInfoPanel() {
  const { user } = useUser();

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
              <span className="text-muted-foreground">0/20</span>
            </div>
            <Progress value={0} className="h-2" />
            <p className="text-xs text-muted-foreground">20 messages remaining this month</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 