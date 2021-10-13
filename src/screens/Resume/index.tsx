import React, {useCallback, useEffect, useState} from 'react';
import { HistoryCard } from '../../components/HistoryCard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { VictoryPie } from 'victory-native';
import { addMonths, subMonths, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {useTheme} from 'styled-components';
import { ActivityIndicator } from 'react-native';
import {useFocusEffect} from '@react-navigation/native';


import {
    Container,
    Header,
    Title,
    Content,
    ChartContainer,
    MonthSelect,
    MonthSelectButton,
    MonthSelectIcon,
    Month,
    LoadContainer,
    MonthHeader,
    Ayuda,
} from './styles';
import { categories } from '../../utils/categories';
import { RFValue } from 'react-native-responsive-fontsize';
import {  useBottomTabBarHeight  } from '@react-navigation/bottom-tabs'
import { useAuth } from '../../hooks/auth';

interface TransactionData {
    type: 'pos' | 'neg';
    name: string;
    amount: string;
    category: string;
    date: string;
}

interface CategoryData{
    key:string;
    name: string;
    color: string;
    totalFormatted: string;
    total: number;
    percent: string;
}

export function Resume(){

    const { user } = useAuth();
const theme = useTheme();
const [isLoading, setIsLoading] = useState(false);

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [totalByCategories, setTotalByCategories] = useState<CategoryData[]>([]);

    function handleChangeDate(
        action : 'next' | 'prev'
    ){
        

        if(action === 'next'){
            const newDate = addMonths(selectedDate, 1);
            setSelectedDate(newDate);
        } else {
            const newDate = subMonths(selectedDate, 1);
            setSelectedDate(newDate);
        }
    }

    async function loadData() {
        setIsLoading(true);
        const dataKey = `@gofinancess:transactions_user:${user.id}`;
        const response = await AsyncStorage.getItem(dataKey);
        const responseFormatted = response ? JSON.parse(response) : [];

        const expensives = responseFormatted
            .filter((expensive: TransactionData) => 
            expensive.type === 'neg' &&
            new Date(expensive.date).getMonth() === selectedDate.getMonth() &&
            new Date(expensive.date).getFullYear() === selectedDate.getFullYear()
            );
        
        const expensivesTotal = expensives.reduce((acumulator : number, expensive : TransactionData) => {
            return acumulator + Number(expensive.amount);
        },0);

        const totalByCategory : CategoryData[]= [];
        
        categories.forEach(category => {
            let categorySum =0;

            expensives.forEach((expensive : TransactionData) => {
                if(expensive.category === category.key){
                    categorySum += Number(expensive.amount);
                }
            });

            if(categorySum > 0){
                const totalFormatted = categorySum
                    .toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                    })

                const percent = `${((categorySum / expensivesTotal) * 100).toFixed(0)}%`;

                totalByCategory.push({
                    key: category.key,
                    name: category.name,
                    color: category.color,
                    total: categorySum,
                    totalFormatted,
                    percent,
                });
            }
            
        });

        setTotalByCategories(totalByCategory);
        setIsLoading(false);

    }

    useFocusEffect(useCallback(() => {
        loadData();
    },[selectedDate]));

    return(
        <Container>
            
            <Header>
                <Title>Resumo por Categoria</Title>
             </Header>
                {
                    isLoading ? 
                        <LoadContainer> 
                            <ActivityIndicator 
                                color={theme.colors.primary}
                                size="large"
                            /> 
                        </LoadContainer> 
                        : 
                

                    <Content
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{
                            paddingHorizontal: 24,
                            paddingBottom: useBottomTabBarHeight(),
                        }}
                    >

                        <MonthHeader>
                            <MonthSelect>
                                <MonthSelectButton onPress={() => handleChangeDate('prev')}>
                                    <MonthSelectIcon name="chevron-left"/>
                                </MonthSelectButton>
                            </MonthSelect>
                            <Ayuda>
                                <Month>
                                    { format(selectedDate, 'MMMM, yyyy', {locale: ptBR}) }
                                </Month>
                            </Ayuda>

                            <MonthSelect>
                                <MonthSelectButton onPress={() => handleChangeDate('next')}>
                                    <MonthSelectIcon name="chevron-right"/>
                                </MonthSelectButton>
                            </MonthSelect>
                        </MonthHeader>

                        <ChartContainer>
                        <VictoryPie 
                            data={totalByCategories}
                            colorScale={totalByCategories.map(category => category.color)}
                            style={{
                                labels: { 
                                    fontSize: RFValue(18),
                                    fontWeight: 'bold',
                                    fill: theme.colors.shape
                                }
                            }}
                            labelRadius={50}
                            x="percent"
                            y="total"
                        />
                        </ChartContainer>

                        {
                            totalByCategories.map(item => (
                                <HistoryCard
                                    key={item.key}
                                    title={item.name}
                                    amount={item.totalFormatted}
                                    color={item.color}
                                />
                            ))
                            
                        }
                    </Content>
                
            }
        </Container>
    );
}