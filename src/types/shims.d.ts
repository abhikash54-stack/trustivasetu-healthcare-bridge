declare module 'expo-constants' {
	const Constants: any;
	export default Constants;
}

declare module '@react-native-async-storage/async-storage' {
	const AsyncStorage: any;
	export default AsyncStorage;
}

declare module 'axios' {
	export interface AxiosResponse<T = any> { data: T }
	export interface AxiosInstance {
		get<T = any>(url: string): Promise<AxiosResponse<T>>;
		post<T = any>(url: string, payload?: any): Promise<AxiosResponse<T>>;
		patch<T = any>(url: string, payload?: any): Promise<AxiosResponse<T>>;
		delete<T = any>(url: string): Promise<AxiosResponse<T>>;
	}
	const axios: { create(config?: any): AxiosInstance };
	export default axios;
}

declare module '@shopify/restyle' {
	export function createBox<T = any>(): any;
	export function createText<T = any>(): any;
	export const ThemeProvider: any;
	export type Theme = any;
	export const Text: any;
	export const Box: any;
}

declare module '@react-navigation/native' {
	export function useNavigation<T = any>(): any;
	export type RouteProp<ParamList, RouteName extends keyof ParamList> = any;
	export const NavigationContainer: any;
}

declare module '@react-navigation/native-stack' {
	export function createNativeStackNavigator<ParamList = any>(): any;
	export type NativeStackNavigationProp<ParamList, RouteName extends keyof ParamList> = any;
}

declare module '@react-navigation/bottom-tabs' {
	export function createBottomTabNavigator<ParamList = any>(): any;
}

declare module '@expo/vector-icons' {
	export const MaterialIcons: any;
}

declare module 'react-native-gesture-handler' {
	export const GestureHandlerRootView: any;
}

declare module '@tanstack/react-query' {
	export function useQuery<T = any>(options: { queryKey: any; queryFn: any; [key: string]: any }): { data?: T; isLoading: boolean; isError: boolean; error: unknown };
	export function useMutation<T = any>(options: { mutationFn: any; [key: string]: any }): { mutate: any; mutateAsync: any; isPending: boolean; isError: boolean; error: unknown };
	export function useInfiniteQuery<T = any>(options: { queryKey: any; queryFn: any; [key: string]: any }): any;
	export class QueryClient {}
	export const QueryClientProvider: any;
}

declare module 'react-redux' {
	export function useSelector(selector: any): any;
	export function useDispatch(): any;
	export const Provider: any;
}

declare module '@reduxjs/toolkit' {
	export function configureStore(opts: any): any;
	export function createSlice(opts: any): any;
	export type PayloadAction<T = any> = { payload: T };
}

// Fallback for any other missing modules
declare module '*';
