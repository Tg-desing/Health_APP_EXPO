import { Hand, Info } from "lucide-react-native";
import React from "react";
import { Text, View } from "react-native";
import Button from "../app/Button";

interface StartPageProps {
  onNavigate: () => void;
}

export function StartPage({ onNavigate }: StartPageProps) {
  return (
    <View className="flex-1 items-center justify-center bg-gray-50 p-4">
      <View className="w-full max-w-[360px]">
        <View className="bg-white rounded-[32px] border-4 border-teal-700 shadow-2xl p-6 relative">

          {/* 로고 */}
          <View className="absolute top-6 left-6">
            <Text className="text-teal-800 font-bold text-base tracking-tight">
              Resisense
            </Text>
          </View>

          <View className="w-full h-full flex flex-col justify-center space-y-6 mt-4">

            {/* 타이틀 */}
            <View className="space-y-2 items-center">
              <Text className="text-teal-900 font-bold text-xl">My Health</Text>

              <Text className="text-gray-900 text-sm font-bold">
                여러분의 건강을 확인하세요
              </Text>

              <Text className="text-gray-600 text-xs px-4 pt-2 text-center">
                센서 회로에서 발산되는 저항 신호를 실시간으로 확인하세요.
              </Text>
            </View>

            {/* 아이콘 영역 */}
            <View className="items-center py-4">
              <View className="relative">
                <Hand size={80} strokeWidth={1.5} color="#333" />

                <View className="absolute -top-2 -right-2 bg-black rounded-full p-2">
                  <Info size={20} color="white" />
                </View>
              </View>
            </View>

            {/* 버튼 + 안내 */}
            <View className="space-y-3">
              <Button
                onPress={onNavigate}
                size="lg"
                className="w-full bg-blue-600 rounded-xl"
              >
                기기 연결하기
              </Button>

              <View className="flex flex-row items-center justify-center gap-1">
                <Info size={14} color="#6b7280" />
                <Text className="text-xs text-gray-500">
                  기기 연결을 위해 Bluetooth 권한이 필요합니다
                </Text>
              </View>
            </View>

          </View>
        </View>
      </View>
    </View>
  );
}
