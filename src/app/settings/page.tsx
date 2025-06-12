import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserInfoPanel } from "@/components/custom/user-info-panel";
import { ModelsSettings } from "@/components/custom/models-settings";
import { ApiKeyForm } from "@/components/custom/api-key-form";
import { ApiKeyStatus } from "@/components/custom/api-key-status";
import { UserProfile } from "@clerk/nextjs";
import { auth, clerkClient } from "@clerk/nextjs/server";

export default async function SettingsPage() {
  const { userId } = await auth();

  // Retrieve user metadata server-side
  let groqApiKey: string | null = null;
  let geminiApiKey: string | null = null;

  if (userId) {
    try {
      const client = await clerkClient();
      const user = await client.users.getUser(userId);
      groqApiKey = user.privateMetadata?.groqApiKey as string | null || null;
      geminiApiKey = user.privateMetadata?.geminiApiKey as string | null || null;
    } catch (error) {
      console.error("Error fetching user keys:", error);
    }
  }
  return (
    <main className="max-w-6xl mx-auto p-4 md:p-8">
      <h1 className="text-2xl md:text-4xl font-bold mb-8">Settings</h1>
      
      <div className="grid md:grid-cols-[280px_1fr] gap-8">
        {/* Colonne de Gauche */}
        <UserInfoPanel />

        {/* Colonne de Droite avec les Onglets */}
        <div className="w-full">
          <Tabs defaultValue="account">
            <TabsList className="mb-4">
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="models">Models</TabsTrigger>
              <TabsTrigger value="byok">API Keys</TabsTrigger>
              <TabsTrigger value="billing" disabled>Billing</TabsTrigger>
            </TabsList>

            <TabsContent value="account">
              {/* On intègre directement le composant Clerk ici */}
              <UserProfile routing="hash" />
            </TabsContent>

            <TabsContent value="models">
              <ModelsSettings />
            </TabsContent>

            <TabsContent value="byok">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <ApiKeyForm 
                    initialGroqApiKey={groqApiKey}
                    initialGeminiApiKey={geminiApiKey}
                  />
                </div>
                <div>
                  <ApiKeyStatus />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="billing">
              {/* Placeholder pour la facturation */}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  );
} 