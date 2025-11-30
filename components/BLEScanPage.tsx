import * as ExpoDevice from "expo-device";
import { router } from "expo-router";
import {
  ChevronLeft,
  RefreshCw,
  SignalHigh,
  SignalLow,
  SignalMedium,
  Smartphone,
  Wifi,
} from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  PermissionsAndroid,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { BleManager, Device } from "react-native-ble-plx"; // 라이브러리 임포트
import Button from "../app/Button"; // 경로 확인 필요

interface BLEScanPageProps {
  onBack: () => void;
  onSimulationConnect: (device: Device) => void; // Device 객체를 넘기도록 수정
}

// 아두이노 코드에서 설정한 Service UUID
const TARGET_SERVICE_UUID = "19B10010-E8F2-537E-4F6C-D104768A1214";
const TARGET_NAME = "Nano33BLE";

function getSignalStrength(rssi: number | null) {
  if (!rssi) return 1;
  if (rssi >= -50) return 4;
  if (rssi >= -60) return 3;
  if (rssi >= -70) return 2;
  return 1;
}

function SignalIcon({ strength }: { strength: number }) {
  if (strength === 4) return <SignalHigh size={22} color="#2563eb" />;
  if (strength === 3) return <SignalHigh size={22} color="#2563eb" />;
  if (strength === 2) return <SignalMedium size={22} color="#2563eb" />;
  return <SignalLow size={22} color="#94a3b8" />;
}

export function BLEScanPage({ onBack, onSimulationConnect }: BLEScanPageProps) {
  // BLE Manager 인스턴스 생성
  const manager = useMemo(() => new BleManager(), []);
  
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState<Device[]>([]);

  // 권한 요청 함수 (Android 31+ 대응)
  const requestPermissions = async () => {
    if (Platform.OS === "android") {
      if ((ExpoDevice.platformApiLevel ?? -1) < 31) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "위치 권한 필요",
            message: "블루투스 스캔을 위해 위치 권한이 필요합니다.",
            buttonNeutral: "나중에",
            buttonNegative: "거부",
            buttonPositive: "허용",
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        const result = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        ]);
        return (
          result["android.permission.BLUETOOTH_CONNECT"] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          result["android.permission.BLUETOOTH_SCAN"] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          result["android.permission.ACCESS_FINE_LOCATION"] ===
            PermissionsAndroid.RESULTS.GRANTED
        );
      }
    }
    return true; // iOS는 Info.plist(config plugin)에서 처리됨
  };

  const handleScan = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      Alert.alert("권한 오류", "블루투스 사용 권한이 거부되었습니다.");
      return;
    }

    setIsScanning(true);
    setDevices([]); // 기존 목록 초기화

    // 스캔 시작
    manager.startDeviceScan(
      null, // 모든 서비스 UUID 스캔 (특정 UUID만 하려면 [TARGET_SERVICE_UUID] 배열 전달)
      { allowDuplicates: false },
      (error, device) => {
        if (error) {
          console.log(error);
          setIsScanning(false);
          return;
        }

        // 필터링: 이름이 'Nano33BLE' 이거나 특정 Service UUID를 가진 기기만 추가
        if (
          device &&
          (device.name === TARGET_NAME || device.localName === TARGET_NAME || 
           device.serviceUUIDs?.includes(TARGET_SERVICE_UUID))
        ) {
          setDevices((prevState) => {
            // 이미 목록에 있는지 중복 체크
            if (!prevState.find((d) => d.id === device.id)) {
              return [...prevState, device];
            }
            return prevState;
          });
        }
      }
    );

    // 5초 후 스캔 종료
    setTimeout(() => {
      manager.stopDeviceScan();
      setIsScanning(false);
    }, 5000);
  };

  useEffect(() => {
    handleScan();
    // 컴포넌트 언마운트 시 매니저 정리
    return () => {
      manager.stopDeviceScan();
      manager.destroy();
    };
  }, []);

  return (
    <View className="flex-1 items-center justify-center bg-gray-50 p-4">
      <View className="w-full max-w-[360px]">
        <View className="bg-white rounded-[32px] border-4 border-teal-700 shadow-2xl p-8 relative">
          
          <TouchableOpacity
            onPress={onBack}
            className="absolute top-6 left-6 p-2"
          >
            <ChevronLeft size={28} color="#444" />
          </TouchableOpacity>

          <View className="w-full h-full flex flex-col justify-center">
            
            <View className="items-center py-4">
              <Wifi size={80} color="#2563eb" strokeWidth={2} />
            </View>

            <Text className="text-center text-gray-900 font-bold text-base mb-4">
              {isScanning ? "Nano33BLE 찾는 중..." : "스캔 완료"}
            </Text>

            <ScrollView
              className="mb-4"
              contentContainerStyle={{ paddingBottom: 12 }}
            >
              {devices.length === 0 ? (
                <Text className="text-center text-gray-400 py-4">
                  발견된 기기가 없습니다.
                </Text>
              ) : (
                devices.map((device) => {
                  const strength = getSignalStrength(device.rssi);
                  return (
                    <TouchableOpacity
                      key={device.id}
                      onPress={() => {
                        // ⭐ 중요: 클릭한 기기의 ID를 들고 '/data' 페이지로 이동!
                        router.push({
                          pathname: "/data",
                          params: { deviceId: device.id } // 여기서 ID를 포장해서 보냅니다
                        });
                      }}
                      className="flex-row items-center justify-between border-2 border-black rounded-2xl p-4 mb-3 bg-white"
                    >
                      <View className="flex-row items-center gap-3">
                        <Smartphone size={24} color="#000" />
                        <View>
                          <Text className="text-gray-900 font-semibold">
                            {device.name || device.localName || "이름 없음"}
                          </Text>
                          <Text className="text-gray-500 text-xs">
                            ID: {device.id.slice(0, 8)}...
                          </Text>
                          <Text className="text-gray-500 text-xs">
                            RSSI: {device.rssi} dBm
                          </Text>
                        </View>
                      </View>

                      <SignalIcon strength={strength} />
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>

            <Button
              onPress={handleScan}
              variant="outline"
              className="w-full rounded-xl h-12 border-2 border-gray-400"
              disabled={isScanning}
            >
              <RefreshCw
                size={16}
                color="#444"
                className={isScanning ? "animate-spin" : ""}
              />
              <Text className="ml-2">재탐색</Text>
            </Button>
          </View>
        </View>
      </View>
    </View>
  );
}