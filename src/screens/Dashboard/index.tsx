import React from 'react';
import { getBottomSpace } from 'react-native-iphone-x-helper';
import { HighlightCard } from '../../components/HighlightCard';
import { TransactionCard, TransactionCardProps } from '../../components/TransactionCard';

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
  } from './styles';

export interface DataListProps extends TransactionCardProps {
    id: string;
}

export function Dashboard() {
    const data: DataListProps[] = [
        {
        id: '1',
        type: 'pos',
        title: "Desenvolver site",
        amount: "12,00",
        category: {
            name: 'Vendas',
            icon: 'dollar-sign'
        },
        date: "25/03/1999"
    },
    {
        id: '2',
        type: 'neg',
        title: "Desenvolver site",
        amount: "12,00",
        category: {
            name: 'Vendas',
            icon: 'dollar-sign'
        },
        date: "25/03/1999"
    },
    {
        id: '3',
        type: 'neg',
        title: "Desenvolver site",
        amount: "12,00",
        category: {
            name: 'Vendas',
            icon: 'dollar-sign'
        },
        date: "25/03/1999"
    }
];
    return (
        <Container>
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
                    
                    <Icon name="power"/>
                </UserWrapper>

                

           </Header>

            <HighlightCards>
                <HighlightCard 
                type="up"
                title="Entradas" 
                amount="R$ 17.400,00" 
                lastTransaction="Última transação dia 25 de março" 
                />
                <HighlightCard
                type="down"
                title="Saídas" 
                amount="R$ 17.000,00" 
                lastTransaction="Última saída dia 25 de março" 
                />
                <HighlightCard
                type="total"
                title="Total" 
                amount="R$ 1.250,00" 
                lastTransaction="01 a 20 de março" 
                />
            </HighlightCards>
            
            <Transactions>
                <Title>Listagem</Title>

                <TransactionList 
                    data={data}
                    keyExtractor={item => item.id}
                    renderItem={({item}) => <TransactionCard data={item} />}
                    
                />

                
            </Transactions>

        </Container>
    )
}