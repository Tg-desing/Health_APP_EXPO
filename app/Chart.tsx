import { Dimensions, View } from "react-native";
import { LineChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

interface DataPoint {
  time: number;
  resistance: number;
  bpm?: number;
}

interface HeartRateChartProps {
  heartRateData: DataPoint[];
}

export default function HeartRateChart({ heartRateData }: HeartRateChartProps) {
  const labels = heartRateData.map((d) => String(d.time));
  const values = heartRateData.map((d) => d.resistance);

  return (
    <View>
      <LineChart
        data={{
          labels: labels,
          datasets: [
            { data: values }
          ]
        }}
        width={screenWidth - 40}
        height={200}
        withDots={false}
        withInnerLines={false}
        chartConfig={{
          backgroundGradientFrom: "#fff",
          backgroundGradientTo: "#fff",
          decimalPlaces: 0,
          color: () => "#2563eb",
          labelColor: () => "#666",
          propsForBackgroundLines: {
            strokeWidth: 0
          },
          propsForLabels: {
            fontSize: 10
          }
        }}
        bezier={false}    // VictoryLine와 비슷한 직선형
        style={{
          borderRadius: 10
        }}
      />
    </View>
  );
}
