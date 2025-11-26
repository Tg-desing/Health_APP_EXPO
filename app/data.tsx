import { Stack, router } from "expo-router";
import DataVisualizationPage from "./DataVisualizationPage";

export default function DataPage() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <DataVisualizationPage
        deviceId="simulation"
        onBack={() => router.back()}
        isSimulation={true}
      />
    </>
  );
}

