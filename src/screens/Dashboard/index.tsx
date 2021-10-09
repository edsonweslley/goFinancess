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

    function getLastTransactionDate(
        collection : DataListProps[], 
        type: 'pos' | 'neg'
        ){
        const lastTransactions = 
        new Date (
        Math.max.apply(Math, collection
            .filter(transaction => transaction.type === type)
            .map(transaction => new Date(transaction.date).getTime())));
            
        return `${lastTransactions.getDate()} de ${lastTransactions.toLocaleString('pt-BR', {month: 'long'})}`;

    }
    
    async function loadTransactions(){
        const dataKey = '@gofinancess:transactions';
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


        const total = entriesTotal - expensiveTotal;

        setHightLightData({
            entries: {
                amount: entriesTotal.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                }),
                lastTransaction: `Última entrada dia ${lastTransactionsEntries}`,
            },
            expensives: {
                amount: expensiveTotal.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                }),
                lastTransaction: `Última saída dia ${lastTransactionsExpensives}`,
            },
            total: {
                amount: total.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                }),
                lastTransaction:'Este mês'
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
                                    source={{ uri: 'https://avatars.githubusercontent.com/u/42748724?v=4'}}
                                />
                                <User>
                                    <UserGreeting>Olá,</UserGreeting>
                                    <UserName>Gabriel</UserName>
                                </User>

                            </UserInfo>
                            
                            <LogoutButton onPress={() => {}}>
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