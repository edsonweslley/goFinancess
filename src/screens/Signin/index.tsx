import React, {useContext, useState} from 'react';
import {ActivityIndicator, Alert, Platform} from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';

import AppleSvg from '../../assets/apple-icon.svg';
import GoogleSvg from '../../assets/google-icon.svg';
import LogoSvg from '../../assets/logo.svg';

import {useAuth} from '../../hooks/auth';
import { useTheme} from 'styled-components';
import { SignInSocialButton } from '../../components/SignInSocialButton';

import {
    Container,
    Header,
    TitleWrapper,
    Title,
    SignInTitle,
    Footer,
    FooterWrapper,
} from './styles';

export function SignIn(){
    const [isLoading, setIsLoading] = useState(false);
    const { signInWithGoogle, singInWithApple } = useAuth();

    const theme = useTheme();

    async function handleSignInWithGoogle(){
        try {
            setIsLoading(true);
            return await signInWithGoogle();
        } catch (error) {
            console.log(error);
            Alert.alert('Não foi possível fazer  login');
            setIsLoading(false);
        } 
    }

    async function handleSignInWithApple(){
        try {
            setIsLoading(true);
            return await singInWithApple();
        } catch (error) {
            console.log(error);
            Alert.alert('Não foi possível fazer  login');
            setIsLoading(false);
        } 
          
        
    }

    return(
        <Container>
            <Header>
                <TitleWrapper>
                    <LogoSvg 
                        width={RFValue(120)}
                        height={RFValue(68)}
                    />

                    <Title>
                        Controle suas {'\n'}
                        finanças de forma {'\n'}
                        muito simples
                    </Title>
                </TitleWrapper>

                <SignInTitle>
                    Faça seu login com {'\n'}
                    umas das contas abaixo
                </SignInTitle>
            </Header>

            <Footer>
                <FooterWrapper>
                    <SignInSocialButton 
                        title="Entrar com uma conta Google"
                        svg={GoogleSvg}
                        onPress={handleSignInWithGoogle}
                    />
                </FooterWrapper>
                <FooterWrapper>
                    { 
                        Platform.OS === 'ios' &&
                        <SignInSocialButton 
                            title="Entrar com uma conta Apple"
                            svg={AppleSvg}
                            onPress={handleSignInWithApple}
                        />
                    }
                </FooterWrapper>

                { isLoading && 
                    <ActivityIndicator 
                        color={theme.colors.shape}
                        style={{marginTop: 18}}
                    />
                }
            </Footer>

        </Container>
    );
}