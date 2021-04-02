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
    place = "408 Brook Pine Trl, Apex,nc"
    geolocator = Nominatim(user_agent="SolarTest")
    location = geolocator.geocode(place)    
    #print(location.longitude)
    #print(location.latitude)    
    return { 'longitude': location.longitude, 'latitude': location.latitude}


@app.route('/getNSRDBData')
def getNSRDBData():
    years = ['2016','2017','2018','2019']
    df = []

    #lat, lon =  location.latitude, location.longitude
    #lat, lon =  getLocation()
    lat, lon =  35.7625474, -78.8912379

    print(lat)
    print(lon)
    api_key = '5qyFRrBVjEZIGuR0WEcihqCEcg4LV8DbErgE6rze'
    attributes = 'ghi'
    leap_year = 'false'
    interval = '30'
    utc = 'false'
    your_name = 'Group_A'
    reason_for_use = 'testing'
    your_affiliation = 'ECU'
    your_email = 'natalea20@students.ecu.edu'
    mailing_list = 'false'

    for year in years:
        url = 'https://developer.nrel.gov/api/solar/nsrdb_psm3_download.csv?wkt=POINT({lon}%20{lat})&names={year}&leap_day={leap}&interval={interval}&utc={utc}&full_name={name}&email={email}&affiliation={affiliation}&mailing_list={mailing_list}&reason={reason}&api_key={api}&attributes={attr}'.format(year=year, lat=lat, lon=lon, leap=leap_year, interval=interval, utc=utc, name=your_name, email=your_email, mailing_list=mailing_list, affiliation=your_affiliation, reason=reason_for_use, api=api_key, attr=attributes)
        df.append(pd.read_csv(url, skiprows=2))    

    # Concatenate Multiple year data into one DataFrame
    big_frame = pd.concat(df, ignore_index=True)

    # Set the time index in the pandas dataframe:
    #big_frame = big_frame.set_index(pd.date_range('1/1/{yr}'.format(yr=2017), freq=interval+'Min', periods=52560 ))
    big_frame = big_frame.set_index(pd.date_range('1/1/{yr}'.format(yr=2016), freq=interval+'Min', periods=70080))

    print(big_frame.shape)

    # filtering data 
    big_frame=big_frame[(big_frame["GHI"]!=0)]
    big_frame.reset_index(inplace=True)

    #New DF with just Index & GHI
    prophet_frame = big_frame[['index','GHI']]
    prophet_frame.head()

    #Renaming columns to ds & y
    prophet_frame = prophet_frame.rename(columns = {'index':'ds','GHI':'y'})
    prophet_frame['ds']=pd.to_datetime(prophet_frame.ds)
    prophet_frame = prophet_frame.set_index(['ds'])

    #Group by to get Monthly Values
    prophet_frame_new = prophet_frame.groupby(prophet_frame.index.date).sum()
    prophet_frame_new.reset_index(inplace=True)
    prophet_frame_new = prophet_frame_new.rename(columns = {'index':'ds'})
    prophet_frame_new['ds']=pd.to_datetime(prophet_frame_new.ds)

    #Drop rows with null values
    prophet_frame_new.dropna() 

    # Pick model 3
    m3 = Prophet(interval_width=0.85,changepoint_prior_scale=5,daily_seasonality=True,yearly_seasonality=20)
    #For Graphs use below
    #m3 = Prophet(interval_width=0.85,daily_seasonality=True,yearly_seasonality=20)
    m3.add_seasonality(name='daily', period=365.25, fourier_order=5, prior_scale=0.02)
    m3.fit(prophet_frame_new)

    # Select the Period for future prediction
    future3 = m3.make_future_dataframe(periods=730)
    forecast3 = m3.predict(future3)

    #Get Yearly Values
    dfprint3 = forecast3[["ds", "trend","yhat_lower", "yhat_upper", "yhat"]]    
    pd.set_option('display.float_format', '{:.2f}'.format)
    dfprint3 = forecast3[["ds",  "yhat"]]
    dfprint3.groupby([dfprint3['ds'].dt.year.rename('year')]).agg({'sum'})


    return 'Working'


if __name__ == '__main__':
    app.run()