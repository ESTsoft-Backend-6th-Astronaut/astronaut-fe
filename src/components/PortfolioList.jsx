import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Typography } from '@mui/material';

function PortfolioItem({
  stockName,
  currentTotalPrice,
  stockCount,
  profitOrLossPrice,
}) {
  return (
    <Box
      sx={{
        border: '1px solid #ccc',
        borderRadius: '8px',
        padding: '13px',
        marginBottom: '13px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: '200px',
      }}
    >
      {/* 주식 이름과 가격 */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px',
        }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
          {stockName}
        </Typography>
        <Typography variant="body1" sx={{ color: '#333' }}>
          {currentTotalPrice}원
        </Typography>
      </Box>

      {/* 주식 개수와 손익 */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="body2" sx={{ color: '#666' }}>
          {stockCount}주
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color:
              parseInt(profitOrLossPrice.replace(/,/g, ''), 10) >= 0
                ? 'red'
                : 'blue',
          }}
        >
          {profitOrLossPrice}
        </Typography>
      </Box>
    </Box>
  );
}

function PortfolioList() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get('/api/portfolios/current_price')
      .then((response) => {
        setData(response.data);
      })
      .catch((error) => {
        setError(error.message);
      });
  }, []);

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <div>
      <h1>최신 주가 정보</h1>
      {data ? (
        data.map((item) => (
          <PortfolioItem
            key={item.stockCode}
            stockName={item.stockName}
            currentTotalPrice={item.currentTotalPrice}
            stockCount={item.stockCount}
            profitOrLossPrice={item.profitOrLossPrice}
          />
        ))
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default PortfolioList;