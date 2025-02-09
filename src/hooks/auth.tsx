import React, { 
    createContext,
    ReactNode,
    useContext,
    useState,
    useEffect,
} from 'react';

const { CLIENT_ID } = process.env;
const { REDIRECT_URI } = process.env;

import * as Google from 'expo-google-app-auth';
import * as AppleAuthentication from 'expo-apple-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext({} as IAuthContextData);

interface AuthProviderProps{
    children: ReactNode
}
interface User{
    id: string;
    name: string;
    email: string;
    photo?: string;
}

interface IAuthContextData {
    user: User;
    signInWithGoogle(): Promise<void>;
    singInWithApple(): Promise<void>;
    signOut(): Promise<void>;
    userStorageLoading: boolean;
}


function  AuthProvider({
    children
} : AuthProviderProps){
    const [user, setUser] = useState<User>({} as User);
    const [userStorageLoading, setUserStorageLoading] = useState(true);

    const userStorageKey = '@gofinances:user';

    async function signInWithGoogle(){
        try {
           const result = await Google.logInAsync({
                androidClientId: CLIENT_ID,
                scopes: ['profile', 'email']
           });

            // const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?
            //     client_id=${CLIENT_ID}&
            //     redirect_uri=${REDIRECT_URI}&
            //     response_type=${RESPONSE_TYPE}&
            //     scope=${SCOPE}`;

            // const {type, params} = await AuthSession
            // .startAsync({  authUrl  }) as AuthorizationResponse;

            if(result.type){
               const userLogged = {
                   id: String(result.user.id),
                   email: result.user.email!,
                   name: result.user.name!,
                   photo: result.user.photoUrl!
               }
                
                setUser(userLogged);
                await AsyncStorage.setItem(userStorageKey, JSON.stringify(userLogged));

            }

        } catch (error) {
            throw new Error(error);
        }


    }

    async function singInWithApple(){
        try {
            const credential = await AppleAuthentication.signInAsync({
                requestedScopes: [
                    AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
                    AppleAuthentication.AppleAuthenticationScope.EMAIL,
                ]
            });

            if(credential){
                const name = credential.fullName!.givenName!;
                const photo = `https://ui-avatars.com/api/?name=${name}&length=1`;
                const userLogged = {
                    id: String(credential.user),
                    email: credential.email!,
                    name,
                    photo, 
                };

                setUser(userLogged);
                await AsyncStorage.setItem(userStorageKey, JSON.stringify(userLogged));
            }

                
            

        } catch (error) {
            throw new Error(error)
        }
    }

    async function signOut(){
        setUser({} as User);
        await AsyncStorage.removeItem(userStorageKey);
    }

    useEffect(() => {
        async function loadUserStorageDate() {
            const userStoraged= await AsyncStorage.getItem(userStorageKey);

            if(userStoraged){
                const userLogged = JSON.parse(userStoraged) as User;
                setUser(userLogged);
            }
            setUserStorageLoading(false);
        }

        loadUserStorageDate();
    },[]);

    return(
        <AuthContext.Provider value={{ 
            user,
            signInWithGoogle,
            singInWithApple,
            signOut,
            userStorageLoading
        }} >
            {children}
          </AuthContext.Provider>
    );
}

function useAuth(){
    const context = useContext(AuthContext);

    return context;
}

export { AuthProvider, useAuth }