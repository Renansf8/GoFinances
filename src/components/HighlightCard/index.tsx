import React from 'react';
import { 
  Contatiner,
  Header,
  Title,
  Icon,
  Footer,
  Amount,
  LastTransaction 
} from './styles';

interface props {
  title: string;
  amount: string;
  lastTransaction: string;
  type: 'up' | 'down' | 'total'
}

const icon = {
  up: 'arrow-up-circle',
  down: 'arrow-down-circle',
  total: 'dollar-sign'
};

export function HighlightCard({title, amount, lastTransaction, type}: props) {
  return (
    <Contatiner type={type}>
      <Header>
        <Title type={type}>{title}</Title>
        <Icon name={icon[type]} type={type} />
      </Header>

      <Footer>
        <Amount type={type}>
          {amount}
        </Amount>
        <LastTransaction type={type}>
          {lastTransaction}
        </LastTransaction>
      </Footer>
    </Contatiner>
  );
};