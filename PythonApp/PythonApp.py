from flask import Flask, render_template
from fbprophet import Prophet
from fbprophet.plot import plot_yearly
from fbprophet.diagnostics import cross_validation
from fbprophet.diagnostics import performance_metrics
from fbprophet.plot import plot_cross_validation_metric
from IPython.display import display
from geopy.geocoders import Nominatim
import pandas as pd
import numpy as np
import sys, os
import matplotlib.pyplot as plt
import pandas as pd
import datetime as dt

app = Flask(__name__)

@app.route('/api/docs')
def get_docs():
    print('sending docs')
    return render_template('swaggerui.html')

@app.route('/greetings')
def greetings():
    return 'May the force be with you!'

@app.route('/getLocation')
def getLocation():
    #place = input ("Enter Address :")
    place = "408 Brook Pine Trl, apex,nc,27523"
    geolocator = Nominatim(user_agent="SolarTest")
    location = geolocator.geocode(place)    
    #print(location.longitude)
    #print(location.latitude)    
    return { 'longitude': location.longitude, 'latitude': location.latitude}


@app.route('/getNSRDBData')
def getNSRDBData():
    
    
    years = ['2016','2017','2018','2019']
    df = []
    location =  getLocation()   
    #lat = location.latitude
    #lon =  location.latitude
    lat, lon =  location['latitude'],location['longitude'] 
    #lat, lon =  location.latitude, location.longitude
    api_key = '5qyFRrBVjEZIGuR0WEcihqCEcg4LV8DbErgE6rze'
    attributes = 'ghi'
    leap_year = 'false'
    interval = '60'
    utc = 'false'
    your_name = 'Narsimha+N'
    reason_for_use = 'testing'
    your_affiliation = 'ECU'
    your_email = 'narayankhedkarn19@students.ecu.edu'
    mailing_list = 'false'

    for year in years:
        url = 'https://developer.nrel.gov/api/solar/nsrdb_psm3_download.csv?wkt=POINT({lon}%20{lat})&names={year}&leap_day={leap}&interval={interval}&utc={utc}&full_name={name}&email={email}&affiliation={affiliation}&mailing_list={mailing_list}&reason={reason}&api_key={api}&attributes={attr}'.format(year=year, lat=lat, lon=lon, leap=leap_year, interval=interval, utc=utc, name=your_name, email=your_email, mailing_list=mailing_list, affiliation=your_affiliation, reason=reason_for_use, api=api_key, attr=attributes)
        df.append(pd.read_csv(url, skiprows=2))    

    # Concatenate Multiple year data into one DataFrame
    big_frame = pd.concat(df, ignore_index=True)
        
    #big_frame = big_frame.set_index(pd.date_range('1/1/{yr}'.format(yr=2017), freq=interval+'Min', periods=52560 ))
    big_frame = big_frame.set_index(pd.date_range('1/1/{yr}'.format(yr=2016), freq=interval+'Min', periods=35040))

    # Set the time index in the pandas dataframe:
    big_frame.reset_index(inplace=True)

    #New DF with just Index & GHI
    prophet_frame = big_frame[['index','GHI']]    
    prophet_frame.head()

    #Renaming columns to ds & y
    prophet_frame_new = prophet_frame.rename(columns = {'index':'ds','GHI':'y'})
    prophet_frame_new['ds']=pd.to_datetime(prophet_frame_new.ds)

    #Limit GHI values between 8 am to 8 pm to better forecast in this time period
    prophet_frame_new = prophet_frame_new[prophet_frame_new['ds'].dt.hour >=8 ]
    prophet_frame_new = prophet_frame_new[prophet_frame_new['ds'].dt.hour <= 20]

    #prophet_frame_new.plot(x='ds',y='y',figsize=(12,8),legend=True,label='GHI Values',xlim=('2016-01-01','2020-01-01'))
    
    #Initialize Prophet
    m = Prophet(interval_width=0.85,changepoint_prior_scale =0.2)
    m.add_seasonality(name='daily', period=365.25, fourier_order=5, prior_scale=5)
    m.fit(prophet_frame_new)

    #create Future Time Periods
    future = m.make_future_dataframe(periods=8812, freq='H')
    future2 = future.copy()
    future2['ds']=pd.to_datetime(future2.ds)
    
    #Discard forecasted timeperiod between 8 am to 8 pm to better forecast in this time period
    future2 = future2[future2['ds'].dt.hour >=8 ]
    future2 = future2[future2['ds'].dt.hour <= 20]

    #Discard rows with negative forecasting
    fcst = m.predict(future2)
    fcst["yhat"] = np.where(fcst["yhat"]<0,0,fcst["yhat"])
    fcst["yhat_lower"] = np.where(fcst["yhat_lower"]<0,0,fcst["yhat_lower"])
    
    #fig = m.plot(fcst)
    #fig1 = m.plot_components(fcst)
    #Filter only the Forecasted Time period
    after_start_date = fcst["ds"] >= '2020-01-01'
    fcst = fcst.loc[after_start_date]

    #Return Final_Forecast which is to be used in the final calculations
    Final_Forecast = fcst[['ds','yhat']]
    Final_Forecast['ds']=pd.to_datetime(Final_Forecast.ds)
    #json = Final_Forecast.to_json()

    json=Final_Forecast.to_json(date_format='iso', date_unit='s')

    return json


if __name__ == '__main__':
    app.run()