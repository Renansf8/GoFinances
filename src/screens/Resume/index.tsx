import React, { useEffect, useState, useCallback } from "react";
import { ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { VictoryPie } from "victory-native";
import { addMonths, subMonths, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useFocusEffect } from "@react-navigation/native";

import { HistoryCard } from "../../components/HistoryCard/Index";

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
} from "./styles";
import { categories } from "../../utils/categories";
import { RFValue } from "react-native-responsive-fontsize";
import { useTheme } from "styled-components";
import { useAuth } from "../../hooks/auth";

interface TransactionData {
  type: "up" | "down";
  name: string;
  amount: string;
  category: string;
  date: string;
}

interface CategoryData {
  key: string;
  name: string;
  total: Number;
  totalFormatted: string;
  color: string;
  percent: string;
}

export function Resume() {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [totalByCategories, setTotalByCategories] = useState<CategoryData[]>(
    []
  );

  const theme = useTheme();
  const { user } = useAuth();

  function handleDateChange(action: "next" | "prev") {
    setIsLoading(true);

    if (action === "next") {
      const newDate = addMonths(selectedDate, 1);
      setSelectedDate(newDate);
    } else {
      const newDate = subMonths(selectedDate, 1);
      setSelectedDate(newDate);
    }
  }

  async function loadData() {
    const dataKey = `@gofinances:transactions_user:${user.id}`;
    const response = await AsyncStorage.getItem(dataKey);
    const responseFormatted = response ? JSON.parse(response) : [];

    const spendings = responseFormatted.filter(
      (spending: TransactionData) =>
        spending.type === "down" &&
        new Date(spending.date).getMonth() === selectedDate.getMonth() &&
        new Date(spending.date).getFullYear() === selectedDate.getFullYear()
    );

    const spendingsTotal = spendings.reduce(
      (acc: number, curr: TransactionData) => {
        return acc + Number(curr.amount);
      },
      0
    );

    const totalByCategory: CategoryData[] = [];

    categories.forEach((category) => {
      let cateogrySum = 0;

      spendings.forEach((spending: TransactionData) => {
        if (spending.category === category.key) {
          cateogrySum += Number(spending.amount);
        }
      });

      if (cateogrySum > 0) {
        const totalFormatted = cateogrySum.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        });

        const percent = `${((cateogrySum / spendingsTotal) * 100).toFixed(0)}%`;

        totalByCategory.push({
          key: category.key,
          name: category.name,
          color: category.color,
          total: cateogrySum,
          totalFormatted,
          percent,
        });
      }
    });
    setTotalByCategories(totalByCategory);
    setIsLoading(false);
  }

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [selectedDate])
  );

  return (
    <Container>
      <Header>
        <Title>Resumo por categoria</Title>
      </Header>
      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <Content showsVerticalScrollIndicator={false}>
          <MonthSelect>
            <MonthSelectButton onPress={() => handleDateChange("prev")}>
              <MonthSelectIcon name="chevron-left" />
            </MonthSelectButton>

            <Month>
              {format(selectedDate, "MMMM, yyyy", { locale: ptBR })}
            </Month>

            <MonthSelectButton onPress={() => handleDateChange("next")}>
              <MonthSelectIcon name="chevron-right" />
            </MonthSelectButton>
          </MonthSelect>

          <ChartContainer>
            <VictoryPie
              data={totalByCategories}
              colorScale={totalByCategories.map((category) => category.color)}
              style={{
                labels: {
                  fontSize: RFValue(18),
                  fontWeight: "bold",
                  fill: theme.colors.shape,
                },
              }}
              labelRadius={50}
              x="percent"
              y="total"
              height={350}
            />
            {totalByCategories.map((item) => (
              <HistoryCard
                key={item.key}
                title={item.name}
                amount={item.totalFormatted}
                color={item.color}
              />
            ))}
          </ChartContainer>
        </Content>
      )}
    </Container>
  );
}
