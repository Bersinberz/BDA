# predict_aqi.py
import pandas as pd
from sklearn.linear_model import LinearRegression
import numpy as np
import sys

# Load dataset
df = pd.read_csv('chennai_hourly_aqi.csv')

# Prepare data
df = df.sort_values(by=['day', 'hour'])
df['hour_index'] = (df['day'] - 1) * 24 + df['hour']
X = df[['hour_index']].values
y = df['overallAQI'].values

# Train model
model = LinearRegression()
model.fit(X, y)

# Predict for next hour
next_hour = np.array([[df['hour_index'].max() + 1]])
predicted_aqi = model.predict(next_hour)[0]

# Print predicted AQI
print(round(predicted_aqi, 2))

