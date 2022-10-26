import React, { useState, useEffect, useCallback } from "react";
import { ActivityIndicator } from "react-native";
import { HighlightCard } from "../../components/HighlightCard";
import {
  TransactionCard,
  TransactionCardProps,
} from "../../components/TransactionCard";
import AsyncStorage from "@react-native-async-storage/async-storage";
import moment from "moment";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../../hooks/auth";

export interface DataListProps extends TransactionCardProps {
  id: string;
}

interface HighlightProps {
  amount: string;
  lastTransaction: string;
}

interface HighlightData {
  entries: HighlightProps;
  spending: HighlightProps;
  total: HighlightProps;
}

import {
  Cotainer,
  Header,
  UserInfo,
  Photo,
  User,
  UserGreeting,
  UserName,
  UserWrapper,
  Icon,
  HighlightCards,
  Transactions,
  Title,
  TransactionList,
  LogoutButton,
} from "./styles";

export function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<DataListProps[]>([]);
  const [highlightData, setHighlightData] = useState<HighlightData>(
    {} as HighlightData
  );

  const { signOut, user } = useAuth();

  function getLastTransactionDate(
    collection: DataListProps[],
    type: "up" | "down"
  ) {
    const collectionFiltered = collection.filter(
      (transaction) => transaction.type === type
    );

    if (collectionFiltered.length === 0) return 0;

    const lastTransaction = new Date(
      Math.max.apply(
        Math,
        collectionFiltered.map((transaction) =>
          new Date(transaction.date).getTime()
        )
      )
    );

    return `${lastTransaction.getDate()} de ${lastTransaction.toLocaleString(
      "pt-BR",
      { month: "long" }
    )}`;
  }

  async function loadTransactions() {
    const dataKey = `@gofinances:transactions_user:${user.id}`;
    const response = await AsyncStorage.getItem(dataKey);
    const transactions = response ? JSON.parse(response) : [];

    let entriesTotal = 0;
    let spendingTotal = 0;

    const transactionsFormatted: DataListProps[] = transactions.map(
      (transaction: DataListProps) => {
        if (transaction.type === "up") {
          entriesTotal += Number(transaction.amount);
        } else {
          spendingTotal += Number(transaction.amount);
        }

        const amount = Number(transaction.amount).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        });

        const date = moment().format("DD/MM/YYYY");

        return {
          id: transaction.id,
          name: transaction.name,
          amount,
          type: transaction.type,
          category: transaction.category,
          date: date,
        };
      }
    );

    setTransactions(transactionsFormatted);

    const lastTransactionEntries = getLastTransactionDate(transactions, "up");
    const lastTransactionSpending = getLastTransactionDate(
      transactions,
      "down"
    );
    const totalInterval =
      lastTransactionSpending === 0
        ? "Não há transações"
        : `01 a ${lastTransactionSpending}`;

    const total = entriesTotal - spendingTotal;

    setHighlightData({
      entries: {
        amount: entriesTotal.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        }),
        lastTransaction:
          lastTransactionEntries === 0
            ? "Não há transações"
            : `Última entrada dia ${lastTransactionEntries}`,
      },
      spending: {
        amount: spendingTotal.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        }),
        lastTransaction:
          lastTransactionSpending === 0
            ? "Não há transações"
            : `Última saída dia ${lastTransactionSpending}`,
      },
      total: {
        amount: total.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        }),
        lastTransaction: totalInterval,
      },
    });

    setIsLoading(false);
  }

  useEffect(() => {
    loadTransactions();
  }, []);

  // Sometimes we want to run side-effects when a screen is focused. A side effect may involve things like adding an event listener, fetching data, updating document title, etc.
  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, [])
  );

  return (
    <Cotainer>
      {isLoading ? (
        <ActivityIndicator />
      ) : (
        <>
          <Header>
            <UserWrapper>
              <UserInfo>
                <Photo
                  source={{
                    uri: user.photo,
                  }}
                />

                <User>
                  <UserGreeting>Olá, </UserGreeting>
                  <UserName>{user.name}</UserName>
                </User>
              </UserInfo>

              <LogoutButton onPress={signOut}>
                <Icon name="power" />
              </LogoutButton>
            </UserWrapper>
          </Header>

          <HighlightCards>
            <HighlightCard
              title="Entradas"
              amount={highlightData.entries.amount}
              lastTransaction={highlightData.entries.lastTransaction}
              type="up"
            />
            <HighlightCard
              title="Saídas"
              amount={highlightData.spending.amount}
              lastTransaction={highlightData.spending.lastTransaction}
              type="down"
            />
            <HighlightCard
              title="Total"
              amount={highlightData.total.amount}
              lastTransaction={highlightData.total.lastTransaction}
              type="total"
            />
          </HighlightCards>

          <Transactions>
            <Title>Listagem</Title>

            <TransactionList
              data={transactions}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <TransactionCard data={item} />}
            />
          </Transactions>
        </>
      )}
    </Cotainer>
  );
}
