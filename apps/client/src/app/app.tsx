import { useCallback } from 'react';
import { useAuthState } from '@kdx-redeemed/client-auth';

export function App() {
  const isAuthed = useAuthState((state) => state.isAuthed);
  const login = useAuthState((state) => state.login);
  const logout = useAuthState((state) => state.logout);

  const onConnectClicked = useCallback(async () => {
    await login();
  }, [login]);

  const onDisconnectClicked = useCallback(async () => {
    await logout().then(console.log).catch(console.error);
  }, [logout]);

  return (
    <div>
      {!isAuthed ? (
        <button
          onClick={onConnectClicked}
          className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
        >
          Connect Wallet
        </button>
      ) : (
        <button
          onClick={onDisconnectClicked}
          className="bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
        >
          Disconnect Wallet
        </button>
      )}
    </div>
  );
}

export default App;
