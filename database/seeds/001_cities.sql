-- Seed data for development (maps to frontend mock data)

INSERT INTO cities (id, name, country, country_code, lat, lng) VALUES
  ('frankfurt', 'Frankfurt', 'Deutschland', 'DE', 50.110924, 8.682127),
  ('berlin', 'Berlin', 'Deutschland', 'DE', 52.520008, 13.404954),
  ('hamburg', 'Hamburg', 'Deutschland', 'DE', 53.551086, 9.993682),
  ('munich', 'München', 'Deutschland', 'DE', 48.137154, 11.576124),
  ('paris', 'Paris', 'Frankreich', 'FR', 48.856613, 2.352222),
  ('amsterdam', 'Amsterdam', 'Niederlande', 'NL', 52.367573, 4.904139);
