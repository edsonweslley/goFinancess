import React, { useCallback, useEffect, useState } from 'react';
import { getBottomSpace } from 'react-native-iphone-x-helper';
import { HighlightCard } from '../../components/HighlightCard';
import { TransactionCard, TransactionCardProps } from '../../components/TransactionCard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { ActivityIndicator } from 'react-native';
import { useTheme } from 'styled-components';

import {  
    Container,
    Header,
    UserWrapper,
    UserInfo,
    Photo,
    User,
    UserGreeting,
    UserName,
    Icon,
    HighlightCards,
    Transactions,
    Title,
    TransactionList,
    LogoutButton,
    LoadContainer,
  } from './styles';
import { useAuth } from '../../hooks/auth';

export interface DataListProps extends TransactionCardProps {
    id: string;
}

interface HighLightProps {
    amount: string;
    lastTransaction: string;
}

interface HighLightData {
    entries: HighLightProps;
    expensives: HighLightProps;
    total: HighLightProps;
}

export function Dashboard() {
    const [isLoading, setIsLoading] = useState(true);
    const [transactions, setTransactions] = useState<DataListProps[]>([])
    const [hightLightData, setHightLightData] = useState<HighLightData>({} as HighLightData);

    const theme = useTheme();
    const { signOut, user } = useAuth();

    function getLastTransactionDate(
        collection : DataListProps[], 
        type: 'pos' | 'neg'
        ){
        
        const collectionFiltered = collection
        .filter(transaction => transaction.type === type);

        if(collectionFiltered.length === 0){
            return 0;
        }

        const lastTransactions = 
        new Date (
        Math.max.apply(Math, collectionFiltered
            .map(transaction => new Date(transaction.date).getTime())));
            
        return `${lastTransactions.getDate()} de ${lastTransactions.toLocaleString('pt-BR', {month: 'long'})}`;

    }
    
    async function loadTransactions(){
        const dataKey = `@gofinancess:transactions_user:${user.id}`;
        const response = await AsyncStorage.getItem(dataKey);
        const transactions = response ? JSON.parse(response) : [];

        let entriesTotal = 0;
        let expensiveTotal = 0;

        const transactionsFormatted : DataListProps[] = transactions
        .map((item : DataListProps) => {
            
            if(item.type === 'pos'){
                entriesTotal += Number(item.amount);
            } else {
                expensiveTotal += Number(item.amount);
            }

            const amount = Number(item.amount)
            .toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
            });

            const date = Intl.DateTimeFormat('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: '2-digit'
            }).format(new Date(item.date));

            return {
                id: item.id,
                name: item.name,
                amount,
                type: item.type,
                category: item.category,
                date,
            }
        
        });

        setTransactions(transactionsFormatted);

       const lastTransactionsEntries = getLastTransactionDate(transactions, 'pos');
       const lastTransactionsExpensives = getLastTransactionDate(transactions, 'neg');


        const totalInterval = lastTransactionsExpensives === 0
        ? 'Não há transações'
        : `01 a ${lastTransactionsExpensives}`;

        const total = entriesTotal - expensiveTotal;

        setHightLightData({
            entries: {
                amount: entriesTotal.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                }),
                lastTransaction: lastTransactionsEntries === 0
                ? 'Não há transações'
                : `Última entrada dia ${lastTransactionsEntries}`,
            },
            expensives: {
                amount: expensiveTotal.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                }),
                lastTransaction: lastTransactionsExpensives === 0
                ? 'Não há transações'
                : `Última saída dia ${lastTransactionsExpensives}`,
            },
            total: {
                amount: total.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                }),
                lastTransaction: totaInterval
            }
        });

        setIsLoading(false);
    }

    useEffect(() => {
        loadTransactions();

        const dataKey = '@gofinancess:transactions';
    },[]);

    useFocusEffect(useCallback(() => {
        loadTransactions();
    },[]));

    return (
        <Container>
            
            { 
            isLoading ? 
                <LoadContainer> 
                    <ActivityIndicator 
                        color={theme.colors.primary}
                        size="large"
                    /> 
                </LoadContainer> 
                : 
            <>
                <Header>
                    <UserWrapper>
                            <UserInfo>
                                <Photo 
                                    source={{ uri: user.photo}}
                                />
                                <User>
                                    <UserGreeting>Olá,</UserGreeting>
                                    <UserName>{user.name}</UserName>
                                </User>

                            </UserInfo>
                            
                            <LogoutButton onPress={signOut}>
                                <Icon name="power"/>
                            </LogoutButton>
                        </UserWrapper>

                        

                </Header>

                    <HighlightCards>
                        <HighlightCard 
                        type="up"
                        title="Entradas" 
                        amount={hightLightData.entries.amount}
                        lastTransaction={hightLightData.entries.lastTransaction}
                        />
                        <HighlightCard
                        type="down"
                        title="Saídas" 
                        amount={hightLightData.expensives.amount} 
                        lastTransaction={hightLightData.expensives.lastTransaction}
                        />
                        <HighlightCard
                        type="total"
                        title="Total" 
                        amount={hightLightData.total.amount}
                        lastTransaction={hightLightData.total.lastTransaction} 
                        />
                    </HighlightCards>
                    
                    <Transactions>
                        <Title>Listagem</Title>

                        <TransactionList 
                            data={transactions}
                            keyExtractor={item => item.id}
                            renderItem={({item}) => <TransactionCard data={item} />}
                            
                        />

                        
                    </Transactions>
            </>
            }

        </Container>
    )
}