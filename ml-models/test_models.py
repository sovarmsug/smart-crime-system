#!/usr/bin/env python3
"""
Test script for ML models in the Smart Crime Prediction System
"""

import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.cluster import KMeans
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import joblib
import os
from datetime import datetime, timedelta
import random

def generate_sample_data(n_samples=1000):
    """Generate sample crime data for testing"""
    
    # Kampala area coordinates (approximate)
    lat_min, lat_max = 0.30, 0.40
    lng_min, lng_max = 32.55, 32.65
    
    crime_types = ['theft', 'assault', 'burglary', 'vandalism', 'fraud', 
                   'drug_offense', 'traffic_violation', 'domestic_violence', 
                   'cyber_crime', 'murder', 'kidnapping', 'other']
    
    severities = ['low', 'medium', 'high', 'critical']
    
    districts = ['Kampala', 'Wakiso', 'Mukono', 'Entebbe']
    
    data = []
    
    for i in range(n_samples):
        # Generate random coordinates within Kampala area
        lat = np.random.uniform(lat_min, lat_max)
        lng = np.random.uniform(lng_min, lng_max)
        
        # Random incident date within last 90 days
        days_ago = random.randint(0, 90)
        incident_date = datetime.now() - timedelta(days=days_ago)
        
        # Random crime attributes
        crime_type = random.choice(crime_types)
        severity = random.choice(severities)
        district = random.choice(districts)
        
        # Time-based features
        hour = random.randint(0, 23)
        day_of_week = incident_date.weekday()
        month = incident_date.month
        
        # Location-based features
        is_weekend = 1 if day_of_week >= 5 else 0
        is_night = 1 if hour >= 20 or hour <= 6 else 0
        
        data.append({
            'latitude': lat,
            'longitude': lng,
            'crime_type': crime_type,
            'severity': severity,
            'district': district,
            'incident_date': incident_date,
            'hour': hour,
            'day_of_week': day_of_week,
            'month': month,
            'is_weekend': is_weekend,
            'is_night': is_night
        })
    
    return pd.DataFrame(data)

def train_crime_type_model(df):
    """Train a model to predict crime types based on location and time"""
    
    # Prepare features
    features = ['latitude', 'longitude', 'hour', 'day_of_week', 'month', 'is_weekend', 'is_night']
    X = df[features]
    y = df['crime_type']
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Train Random Forest model
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    # Evaluate
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    
    print(f"Crime Type Prediction Model Accuracy: {accuracy:.3f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))
    
    # Save model
    joblib.dump(model, 'crime_type_model.pkl')
    
    return model, accuracy

def train_severity_model(df):
    """Train a model to predict crime severity"""
    
    # Prepare features
    features = ['latitude', 'longitude', 'hour', 'day_of_week', 'month', 'is_weekend', 'is_night']
    X = df[features]
    y = df['severity']
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Train Random Forest model
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    # Evaluate
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    
    print(f"Crime Severity Prediction Model Accuracy: {accuracy:.3f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))
    
    # Save model
    joblib.dump(model, 'severity_model.pkl')
    
    return model, accuracy

def find_hotspots(df, n_clusters=10):
    """Find crime hotspots using clustering"""
    
    # Use coordinates for clustering
    coordinates = df[['latitude', 'longitude']].values
    
    # Apply K-means clustering
    kmeans = KMeans(n_clusters=n_clusters, random_state=42)
    cluster_labels = kmeans.fit_predict(coordinates)
    
    # Add cluster labels to dataframe
    df['cluster'] = cluster_labels
    
    # Calculate cluster statistics
    hotspot_stats = []
    for cluster_id in range(n_clusters):
        cluster_data = df[df['cluster'] == cluster_id]
        
        if len(cluster_data) > 0:
            center_lat = cluster_data['latitude'].mean()
            center_lng = cluster_data['longitude'].mean()
            crime_count = len(cluster_data)
            
            # Calculate severity score for this cluster
            severity_scores = {'low': 1, 'medium': 2, 'high': 3, 'critical': 4}
            avg_severity = cluster_data['severity'].map(severity_scores).mean()
            
            # Most common crime type
            most_common_crime = cluster_data['crime_type'].mode().iloc[0]
            
            hotspot_stats.append({
                'cluster_id': cluster_id,
                'center_latitude': center_lat,
                'center_longitude': center_lng,
                'crime_count': crime_count,
                'avg_severity': avg_severity,
                'most_common_crime': most_common_crime
            })
    
    # Sort by crime count to find most active hotspots
    hotspot_stats.sort(key=lambda x: x['crime_count'], reverse=True)
    
    # Save clustering model
    joblib.dump(kmeans, 'hotspot_clustering_model.pkl')
    
    return hotspot_stats

def predict_crime_probability(model, location, time_features):
    """Predict probability of different crime types at a given location and time"""
    
    # Prepare input features
    features = np.array([[location['latitude'], location['longitude'], 
                         time_features['hour'], time_features['day_of_week'], 
                         time_features['month'], time_features['is_weekend'], 
                         time_features['is_night']]])
    
    # Get probability predictions
    probabilities = model.predict_proba(features)[0]
    classes = model.classes_
    
    # Create probability dictionary
    crime_probabilities = dict(zip(classes, probabilities))
    
    return crime_probabilities

def main():
    """Main function to test all ML models"""
    
    print("=== Smart Crime Prediction System - ML Models Test ===\n")
    
    # Generate sample data
    print("1. Generating sample crime data...")
    df = generate_sample_data(1000)
    print(f"Generated {len(df)} sample crime records")
    print(f"Date range: {df['incident_date'].min()} to {df['incident_date'].max()}")
    print(f"Crime types: {df['crime_type'].nunique()} different types")
    print(f"Districts: {df['district'].nunique()} districts\n")
    
    # Train crime type prediction model
    print("2. Training Crime Type Prediction Model...")
    crime_type_model, crime_type_accuracy = train_crime_type_model(df)
    print(f"Model saved as 'crime_type_model.pkl'\n")
    
    # Train severity prediction model
    print("3. Training Crime Severity Prediction Model...")
    severity_model, severity_accuracy = train_severity_model(df)
    print(f"Model saved as 'severity_model.pkl'\n")
    
    # Find crime hotspots
    print("4. Finding Crime Hotspots...")
    hotspots = find_hotspots(df)
    print(f"Found {len(hotspots)} crime hotspots")
    print("\nTop 5 Hotspots:")
    for i, hotspot in enumerate(hotspots[:5]):
        print(f"  {i+1}. Cluster {hotspot['cluster_id']}: {hotspot['crime_count']} crimes")
        print(f"     Location: ({hotspot['center_latitude']:.4f}, {hotspot['center_longitude']:.4f})")
        print(f"     Most common crime: {hotspot['most_common_crime']}")
        print(f"     Average severity: {hotspot['avg_severity']:.2f}")
    print(f"Clustering model saved as 'hotspot_clustering_model.pkl'\n")
    
    # Test prediction with sample input
    print("5. Testing Crime Prediction...")
    sample_location = {
        'latitude': 0.3476,  # Kampala center
        'longitude': 32.5825
    }
    
    sample_time = {
        'hour': 14,  # 2 PM
        'day_of_week': 2,  # Tuesday
        'month': 4,  # April
        'is_weekend': 0,
        'is_night': 0
    }
    
    crime_probabilities = predict_crime_probability(crime_type_model, sample_location, sample_time)
    print(f"Crime type probabilities for location ({sample_location['latitude']}, {sample_location['longitude']}):")
    for crime_type, prob in sorted(crime_probabilities.items(), key=lambda x: x[1], reverse=True):
        print(f"  {crime_type}: {prob:.3f}")
    
    print("\n=== Test Summary ===")
    print(f"Crime Type Model Accuracy: {crime_type_accuracy:.3f}")
    print(f"Severity Model Accuracy: {severity_accuracy:.3f}")
    print(f"Hotspots Identified: {len(hotspots)}")
    print(f"Sample Data Records: {len(df)}")
    
    print("\n=== Models Saved ===")
    print("- crime_type_model.pkl")
    print("- severity_model.pkl") 
    print("- hotspot_clustering_model.pkl")
    
    print("\n=== Test Completed Successfully ===")
    print("ML models are ready for integration with the main system!")

if __name__ == "__main__":
    main()
