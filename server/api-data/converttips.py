import json
import psycopg2

# Load JSON data from a file
def load_json_data(file_path):
    with open(file_path, 'r') as file:
        data = json.load(file)
    return data

def check_champion_tips_exist(cursor, champion_key, game_version):
    cursor.execute("""
        SELECT 1 FROM champion_tips 
        WHERE champion_key = %s AND game_version = %s;
    """, (champion_key, game_version))
    return cursor.fetchone() is not None

# Insert champion data into the database
def insert_champion_data(cursor, champion_id, game_version, champion_data):
    
    if check_champion_tips_exist(cursor, champion_id, game_version):
        return
    
    # Prepare champion tips data
    tips_data = {
        'champion_key': champion_id,
        'game_version': game_version,
        'identity_short': champion_data['championTips']['identity']['short'],
        'identity_long': champion_data['championTips']['identity']['long'],
        'strengths_short': champion_data['championTips']['strengths']['short'],
        'strengths_long': champion_data['championTips']['strengths']['long'],
        'weaknesses_short': champion_data['championTips']['weaknesses']['short'],
        'weaknesses_long': champion_data['championTips']['weaknesses']['long'],
        'earlygame_short': champion_data['championTips']['earlygame']['short'],
        'earlygame_long': champion_data['championTips']['earlygame']['long'],
        "midgame_short": champion_data['championTips']['midgame']['short'],
        "midgame_long": champion_data['championTips']['midgame']['long'],
        "lategame_short": champion_data['championTips']['lategame']['short'],
        "lategame_long": champion_data['championTips']['lategame']['long'],
        "teamfight_short": champion_data['championTips']['teamfight']['short'],
        "teamfight_long": champion_data['championTips']['teamfight']['long'],
        "mindset_short": champion_data['championTips']['mindset']['short'],
        "mindset_long": champion_data['championTips']['mindset']['long'],
        "counter_short": champion_data['championTips']['counter']['short'],
        "counter_long": champion_data['championTips']['counter']['long'],
        "skillSynergy": champion_data['championTips']['insights']['skillSynergy'],
        "uniqueMechanics": champion_data['championTips']['insights']['uniqueMechanics'],
        "situationalTips": champion_data['championTips']['insights']['situationalTips']
    }
    # Insert champion tips
    cursor.execute("""
    INSERT INTO champion_tips (
        champion_key, game_version, identity_short, identity_long,
        strengths_short, strengths_long, weaknesses_short, weaknesses_long,
        earlygame_short, earlygame_long, midgame_short, midgame_long, lategame_short, lategame_long, 
        teamfight_short, teamfight_long, mindset_short, mindset_long, counter_short, counter_long,
        skillSynergy, uniqueMechanics, situational_tips
    ) VALUES (
        %(champion_key)s, %(game_version)s, %(identity_short)s, %(identity_long)s,
        %(strengths_short)s, %(strengths_long)s, %(weaknesses_short)s, %(weaknesses_long)s,
        %(earlygame_short)s, %(earlygame_long)s, %(midgame_short)s, %(midgame_long)s, %(lategame_short)s, %(lategame_long)s,
        %(teamfight_short)s, %(teamfight_long)s, %(mindset_short)s, %(mindset_long)s, %(counter_short)s, %(counter_long)s,
        %(skillSynergy)s, %(uniqueMechanics)s, %(situationalTips)s
    );
    """, tips_data)

    # Assuming you have a function to fetch the champion ID from the 'champions' table
def get_champion_id(cursor, champion_name):
    cursor.execute("SELECT key FROM champions WHERE name = %s;", (champion_name,))
    result = cursor.fetchone()
    if result:
        return result[0]
    else:
        return None  # Handle the case where the champion name is not found


def main():
    # Load the JSON data
    json_data = load_json_data('./champion_tips.json')
    
    # Connect to your PostgreSQL database
    conn = psycopg2.connect(
        dbname="db-1",
        user="dbadmin",
        password="",
        host="35.198.153.152"
    )
    cursor = conn.cursor()
    
    # Inside your main loop
    for champion_name, champion_data in json_data.items():
        game_version = champion_data['version']
        champion_id = get_champion_id(cursor, champion_name)
        
        if champion_id is not None:
            insert_champion_data(cursor, champion_id, game_version, champion_data)
            print(f"Champion '{champion_name}' tips inserted successfully.")
        else:
            print(f"Champion '{champion_name}' not found in the 'champions' table.")
        
    # Commit transactions and close the connection
    conn.commit()
    cursor.close()
    conn.close()

if __name__ == "__main__":
    main()
