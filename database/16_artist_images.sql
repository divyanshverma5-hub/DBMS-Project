USE music_mood_db;

-- Add reusable artist artwork sourced from Wikimedia Commons.
-- URLs point to Commons' Special:FilePath endpoint so thumbnails can be resized by the source.
UPDATE artist
SET image_url = CASE name
  WHEN 'Shilpa Rao' THEN 'https://commons.wikimedia.org/wiki/Special:FilePath/Shilpa_Rao.jpg?width=600'
  WHEN 'Arijit Singh' THEN 'https://commons.wikimedia.org/wiki/Special:FilePath/Arijittt.jpg?width=600'
  WHEN 'The Beatles' THEN 'https://commons.wikimedia.org/wiki/Special:FilePath/The_Beatles_%28band%29.jpg?width=600'
  WHEN 'Nirvana' THEN 'https://commons.wikimedia.org/wiki/Special:FilePath/Nirvana_around_1992_%28high_quality%29_%28cropped%29.jpg?width=600'
  WHEN 'Sunidhi Chauhan' THEN 'https://commons.wikimedia.org/wiki/Special:FilePath/Sunidhi_chauhan.jpg?width=600'
  WHEN 'Foo Fighters' THEN 'https://commons.wikimedia.org/wiki/Special:FilePath/Foo_Fighters.jpg?width=600'
  WHEN 'Shreya Ghoshal' THEN 'https://commons.wikimedia.org/wiki/Special:FilePath/Shreya_at_concert.jpg?width=600'
  WHEN 'Tame Impala' THEN 'https://commons.wikimedia.org/wiki/Special:FilePath/Tame_Impala.jpg?width=600'
  ELSE image_url
END
WHERE name IN (
  'Shilpa Rao', 'Arijit Singh', 'The Beatles', 'Nirvana',
  'Sunidhi Chauhan', 'Foo Fighters', 'Shreya Ghoshal', 'Tame Impala'
);
