import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { LineChart } from '@mui/x-charts/LineChart';
import { Typography } from '@mui/material';

const RecommendStockSearchVolume = ({ keywordId }) => {
  // 상태값 초기화
  const [data, setData] = useState([]);
  const [xAxisData, setXAxisData] = useState([]);
  const [hour, setHour] = useState(new Date().getHours()); // 현재 시간 상태

  // 추천 종목 가져오기
  const fetchRecommendStocks = async () => {
    try {
      const response = await axios.get(`/api/keywords/${keywordId}`);

      // 날짜순으로 데이터 정렬
      const sortedData = response.data.sort(
        (a, b) => new Date(a.searchDate) - new Date(b.searchDate),
      );

      // 어제제 날짜 기준으로 지난 10일간의 날짜 계산
      // 데이터가 갱신되기 전인 오전 6시 전에는 그 전날의 데이터를 보여주도록
      const yesterday = new Date();
      if (hour < 6) {
        yesterday.setDate(yesterday.getDate() - 2);
      } else {
        yesterday.setDate(yesterday.getDate() - 1);
      }

      const past10Days = Array.from({ length: 10 }, (_, i) => {
        const date = new Date(yesterday);
        date.setDate(yesterday.getDate() - i);
        return date.toISOString().split('T')[0];
      });

      // 고유 날짜 추출(LocalDate를 문자열로 변환)
      const dates = past10Days.reverse();

      // 주식 이름름별로 데이터 그룹핑
      const stockGroups = sortedData.reduce((acc, item) => {
        if (item.stockName) {
          if (!acc[item.stockName]) {
            acc[item.stockName] = [];
          }
          acc[item.stockName].push(item);
        }

        return acc;
      }, {});

      // 데이터 변환
      const transformedData = Object.keys(stockGroups).map((stockName) => {
        const stockData = stockGroups[stockName];

        // 날짜별 데이터 정렬, 없는 날짜는 0으로 처리
        const dataForStock = dates.map((date) => {
          const stockItem = stockData.find((item) => item.searchDate === date);
          return stockItem ? stockItem.searchVolume : 0;
        });

        return {
          label: stockName,
          data: dataForStock,
        };
      });

      setXAxisData(dates);
      setData(transformedData);

      // 디버깅용 로그
      console.log('변환된 날짜:', dates);
      console.log('변환된 데이터:', transformedData);
    } catch (error) {
      console.error('추천 종목 이름 및 검색량 데이터 조회 오류 발생:', error);
      // 에러 시 빈 배열로 설정
      setData([]);
    }
  };

  // 컴포넌트 마운트 시 데이터 불러오기
  useEffect(() => {
    fetchRecommendStocks();
  }, [keywordId]);

  // 컴포넌트 마운트 시 매번 hour 값을 업데이트
  useEffect(() => {
    setHour(new Date().getHours());
  }, []);
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Typography
        variant="h6"
        component="div"
        fontWeight="600"
        sx={{ marginTop: '50px' }}
      >
        주식 검색 추이
      </Typography>
      <LineChart
        xAxis={[
          {
            id: 'x-axis',
            data: xAxisData,
            scaleType: 'point',
            label: '날짜',
          },
        ]}
        series={data.map((item) => ({
          label: item.label,
          data: item.data,
        }))}
        height={600}
        margin={{ bottom: 70, left: 80 }}
        sx={{
          '& .MuiChartsAxis-root .MuiChartsAxis-label': {
            display: 'none',
          },
          //범례
          '& .MuiChartsLegend-root': {
            display: 'flex',
            justifyContent: 'center',
            marginTop: '20px',
          },
        }}
        legend={{
          position: { vertical: 'bottom', horizontal: 'middle' },
        }}
      />
      {/* 데이터 갱신 전(오전 6시 전)에는 갱신 전 문구 출력 */}
      <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
        {hour < 6 ? '오늘의 데이터 갱신 전입니다.' : ''}
      </Typography>
    </div>
  );
};

export default RecommendStockSearchVolume;
