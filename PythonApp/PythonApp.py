from flask import Flask, render_template
from geopy.geocoders import Nominatim

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
    print(location.longitude)
    print(location.latitude)

    return { 'longitude': location.longitude, 'latitude': location.latitude}

@app.route('/getNSRDBData')
def getNSRDBData():
    years = ['2016','2017','2018','2019']
    df = []

    #lat, lon =  location.latitude, location.longitude
    lat, lon =  getLocation()
    api_key = '5qyFRrBVjEZIGuR0WEcihqCEcg4LV8DbErgE6rze'
    attributes = 'ghi'
    leap_year = 'false'
    interval = '30'
    utc = 'false'
    your_name = 'Anthony+N'
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

    return big_frame


if __name__ == '__main__':
    app.run()