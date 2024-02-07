import json
import psycopg2

# Function to load JSON data from a file
def load_json_data(file_path):
    with open(file_path, 'r', encoding='utf-8') as file:
        data = json.load(file)
    return data

# Function to insert champion data into the database
def insert_champions(cursor, champions_data):
    for champion_id, details in champions_data['data'].items():
        try:
            # Inserting data with "key" as the primary key
            cursor.execute("INSERT INTO champions (key, name) VALUES (%s, %s) ON CONFLICT (key) DO NOTHING;",
                           (int(details["key"]), details["name"]))  # Ensure "key" is treated as an integer
            print(f"Inserted champion with key {details['key']}: {details['name']}")
        except psycopg2.Error as e:
            print(f"Error inserting champion with key {details['key']}: {e}")
            continue

def main():
    # Path to your JSON file
    json_file_path = './champions.json'
    
    # Load the JSON data
    champions_data = load_json_data(json_file_path)
    
    # Database connection parameters - replace with your details
    conn = psycopg2.connect(
        dbname="db-1",
        user="dbadmin",
        password="",
        host="35.198.153.152"
    )
    cursor = conn.cursor()
    
    # Insert the champion data
    insert_champions(cursor, champions_data)
    
    # Commit the transactions and close the connection
    conn.commit()
    cursor.close()
    conn.close()

if __name__ == "__main__":
    main()
