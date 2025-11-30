import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import DataVisualizationPage from "./DataVisualizationPage";

export default function DataPage() {
  const router = useRouter();
  const { deviceId } = useLocalSearchParams();
  const targetId = Array.isArray(deviceId) ? deviceId[0] : deviceId;
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <DataVisualizationPage
        deviceId={targetId}
        onBack={() => router.back()}
        isSimulation={false}
    />
  </>
  );
}

