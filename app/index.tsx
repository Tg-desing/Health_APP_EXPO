import { router, Stack } from "expo-router";
import { StartPage } from "../components/StartPage";

export default function Index() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <StartPage onNavigate={() => router.push("./scan")} />
    </>
  );
}
