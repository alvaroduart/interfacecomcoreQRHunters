import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef = createNavigationContainerRef<any>();

export function navigate(name: string, params?: any) {
  if (navigationRef.isReady()) {
    (navigationRef as any).navigate(name, params);
  }
}

export function resetRootToLogin() {
  if (navigationRef.isReady()) {
    try {
      navigationRef.reset({ index: 0, routes: [{ name: 'Login' }] });
    } catch (e) {
      // ignore
    }
  }
}

export default navigationRef;
