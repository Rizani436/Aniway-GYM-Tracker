import { PrismaClient, MuscleGroup, EquipmentType } from '@prisma/client';

const prisma = new PrismaClient();

interface SeedExercise {
  name: string;
  primaryMuscle: MuscleGroup;
  secondaryMuscles: MuscleGroup[];
  equipment: EquipmentType;
  weightIncrement: number;
  steps: string[];
  tips: string[];
  commonMistakes: string[];
  videoUrl: string;
  alternatives: string[];
}

const machineExercises: SeedExercise[] = [
  // ==================== 1. DADA / CHEST (6 Gerakan) ====================
  {
    name: 'Seated Chest Press Machine',
    primaryMuscle: MuscleGroup.CHEST,
    secondaryMuscles: [MuscleGroup.TRICEPS, MuscleGroup.SHOULDERS],
    equipment: EquipmentType.MACHINE,
    weightIncrement: 5,
    steps: [
      'Atur ketinggian kursi sehingga pegangan (handle) sejajar dengan bagian tengah dada (sekitar garis puting).',
      'Duduk tegak, tempelkan punggung dan kepala pada sandaran, lalu tarik tulang belikat ke belakang (retraksi skapula).',
      'Pegang handle dengan genggaman penuh dan dorong ke depan sembari membuang napas hingga lengan hampir lurus (jangan mengunci siku secara paksa).',
      'Turunkan beban kembali secara perlahan selama 2-3 detik sambil menarik napas hingga terasa regangan pada otot dada.'
    ],
    tips: [
      'Bayangkan Anda sedang mendorong tubuh menjauh dari pegangan sambil menekan punggung ke bantalan kursi.',
      'Jaga siku membentuk sudut sekitar 45-60 derajat terhadap tubuh, bukan melebar 90 derajat.'
    ],
    commonMistakes: [
      'Bahu ikut terangkat mendekati telinga saat mendorong beban.',
      'Melepas tempelan punggung atas dari sandaran kursi di akhir dorongan.',
      'Memantulkan tumpukan beban di bagian bawah gerakan.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=seated+chest+press+machine+form',
    alternatives: ['Incline Chest Press Machine', 'Smith Machine Flat Bench Press']
  },
  {
    name: 'Incline Chest Press Machine',
    primaryMuscle: MuscleGroup.CHEST,
    secondaryMuscles: [MuscleGroup.SHOULDERS, MuscleGroup.TRICEPS],
    equipment: EquipmentType.PLATE_LOADED,
    weightIncrement: 5,
    steps: [
      'Pasang beban plate yang sesuai di kedua sisi mesin dan atur kursi agar pegangan sejajar dengan dada bagian atas (klavikula).',
      'Duduk mantap dengan kaki menapak kuat di lantai dan dada dibusungkan.',
      'Dorong pegangan ke arah atas-depan mengikuti jalur mesin sambil membuang napas.',
      'Tahan 1 detik di puncak kontraksi, lalu turunkan kembali secara terkontrol.'
    ],
    tips: [
      'Fokuskan kontraksi pada serat dada atas (upper chest) dengan menjaga dada tetap membusung sepanjang set.',
      'Pastikan pergelangan tangan tetap lurus sejajar dengan lengan bawah.'
    ],
    commonMistakes: [
      'Mengatur kursi terlalu tinggi sehingga beban justru lebih banyak mengenai bahu depan.',
      'Mengangkat bokong dari kursi saat mendorong beban berat.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=incline+chest+press+machine+form',
    alternatives: ['Smith Machine Incline Press', 'Low-to-High Cable Chest Fly']
  },
  {
    name: 'Decline Chest Press Machine',
    primaryMuscle: MuscleGroup.CHEST,
    secondaryMuscles: [MuscleGroup.TRICEPS, MuscleGroup.SHOULDERS],
    equipment: EquipmentType.PLATE_LOADED,
    weightIncrement: 5,
    steps: [
      'Atur kursi sehingga posisi dorongan mengarah sedikit ke bawah menuju bagian bawah dada (sternum bawah).',
      'Kunci tulang belikat ke belakang dan genggam handle dengan kuat.',
      'Dorong beban ke depan-bawah hingga siku hampir lurus sambil menghembuskan napas.',
      'Kembalikan beban perlahan tanpa membiarkan beban terhempas.'
    ],
    tips: [
      'Sangat efektif untuk menargetkan dada bagian bawah tanpa memberi tekanan berlebih pada sendi bahu.',
      'Jaga leher tetap rileks menempel pada sandaran.'
    ],
    commonMistakes: [
      'Memendekkan rentang gerak (setengah jalan) karena memasang beban terlalu berat.',
      'Siku membuka terlalu lebar ke samping.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=decline+chest+press+machine+form',
    alternatives: ['Seated Dip Machine (Tricep Press)', 'Standing Cable Chest Fly (Mid Pulley)']
  },
  {
    name: 'Pec Deck / Machine Chest Fly',
    primaryMuscle: MuscleGroup.CHEST,
    secondaryMuscles: [MuscleGroup.SHOULDERS],
    equipment: EquipmentType.MACHINE,
    weightIncrement: 5,
    steps: [
      'Atur tinggi kursi agar pegangan atau bantalan lengan berada tepat setinggi dada tengah.',
      'Duduk tegak, buka lengan memegang handle dengan siku sedikit ditekuk (soft elbow).',
      'Satukan kedua lengan ke depan dada dalam gerakan memeluk pohon sambil membuang napas.',
      'Peras otot dada selama 1-2 detik di tengah, lalu buka kembali lengan secara perlahan hingga dada terasa teregang.'
    ],
    tips: [
      'Fokuskan pikiran untuk mempertemukan kedua siku bagian dalam, bukan sekadar mempertemukan telapak tangan.',
      'Jangan biarkan bahu tertarik ke depan saat kedua tangan bertemu di tengah.'
    ],
    commonMistakes: [
      'Mengubah gerakan menjadi dorongan (press) dengan menekuk siku terlalu banyak.',
      'Membuka lengan terlalu jauh ke belakang melewati batas fleksibilitas bahu.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=pec+deck+machine+fly+form',
    alternatives: ['Standing Cable Chest Fly (Mid Pulley)', 'Seated Chest Press Machine']
  },
  {
    name: 'Standing Cable Chest Fly (Mid Pulley)',
    primaryMuscle: MuscleGroup.CHEST,
    secondaryMuscles: [MuscleGroup.SHOULDERS],
    equipment: EquipmentType.CABLE,
    weightIncrement: 2.5,
    steps: [
      'Atur kedua katrol (pulley) setinggi dada dan pasang D-handle di kedua sisi.',
      'Berdiri di tengah, ambil satu langkah ke depan dengan satu kaki untuk keseimbangan, dan condongkan badan sedikit ke depan.',
      'Dengan siku sedikit ditekuk dan terkunci sudutnya, tarik kedua handle menyatu di depan dada.',
      'Tahan kontraksi sejenak, lalu rentangkan kembali lengan secara terkontrol.'
    ],
    tips: [
      'Pertahankan sudut tekukan siku yang sama dari awal hingga akhir gerakan.',
      'Silangkan sedikit pergelangan tangan di puncak gerakan untuk kontraksi dada bagian dalam yang lebih maksimal.'
    ],
    commonMistakes: [
      'Mengayunkan badan ke depan dan belakang untuk membantu menarik beban.',
      'Meluruskan dan menekuk siku seperti gerakan triceps press.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=standing+cable+chest+fly+form',
    alternatives: ['Pec Deck / Machine Chest Fly', 'Low-to-High Cable Chest Fly']
  },
  {
    name: 'Smith Machine Flat Bench Press',
    primaryMuscle: MuscleGroup.CHEST,
    secondaryMuscles: [MuscleGroup.TRICEPS, MuscleGroup.SHOULDERS],
    equipment: EquipmentType.SMITH_MACHINE,
    weightIncrement: 5,
    steps: [
      'Posisikan bangku datar tepat di tengah Smith Machine sehingga saat berbaring, palang berada sejajar dengan dada tengah.',
      'Genggam palang sedikit lebih lebar dari bahu, putar palang untuk membuka pengait pengaman.',
      'Turunkan palang secara terkontrol hingga hampir menyentuh dada tengah sambil menarik napas.',
      'Dorong palang kembali ke atas sambil membuang napas dan pasang kembali pengait saat set selesai.'
    ],
    tips: [
      'Selalu pasang stopper pengaman (safety catch) di sisi kiri-kanan Smith Machine tepat di bawah tinggi dada Anda.',
      'Jaga telapak kaki menapak stabil di lantai.'
    ],
    commonMistakes: [
      'Posisi bangku terlalu maju atau mundur sehingga jalur palang jatuh di leher atau perut.',
      'Memantulkan palang di dada.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=smith+machine+flat+bench+press+form',
    alternatives: ['Seated Chest Press Machine', 'Decline Chest Press Machine']
  },

  // ==================== 2. PUNGGUNG / BACK (7 Gerakan) ====================
  {
    name: 'Wide-Grip Lat Pulldown Machine',
    primaryMuscle: MuscleGroup.BACK,
    secondaryMuscles: [MuscleGroup.BICEPS, MuscleGroup.FOREARMS],
    equipment: EquipmentType.CABLE,
    weightIncrement: 5,
    steps: [
      'Duduk di mesin Lat Pulldown dan kunci paha di bawah bantalan penahan lutut agar tubuh tidak terangkat.',
      'Pegang palang panjang dengan genggaman overhand (telapak menghadap depan) sedikit lebih lebar dari bahu.',
      'Busungkan dada, condongkan punggung sedikit ke belakang (sekitar 10-15 derajat), dan tarik palang ke arah dada atas.',
      'Tahan sejenak sambil meremas punggung samping (lats), lalu ulur kembali palang ke atas secara perlahan.'
    ],
    tips: [
      'Bayangkan Anda menarik beban menggunakan siku yang diarahkan ke kantong celana, bukan menarik dengan jari dan bisep.',
      'Gunakan genggaman thumbless (ibu jari sejajar jari lain) untuk mengurangi dominasi lengan bawah.'
    ],
    commonMistakes: [
      'Menarik palang ke belakang leher yang berisiko mencederai sendi bahu.',
      'Mengayunkan punggung terlalu jauh ke belakang seperti gerakan mendayung.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=wide+grip+lat+pulldown+form',
    alternatives: ['Close-Grip Neutral Lat Pulldown', 'Assisted Pull-Up Machine']
  },
  {
    name: 'Close-Grip Neutral Lat Pulldown',
    primaryMuscle: MuscleGroup.BACK,
    secondaryMuscles: [MuscleGroup.BICEPS],
    equipment: EquipmentType.CABLE,
    weightIncrement: 5,
    steps: [
      'Pasang V-bar atau close-grip neutral handle pada mesin Lat Pulldown.',
      'Duduk dan kunci paha di bawah bantalan, lalu genggam handle dengan kedua telapak tangan saling berhadapan.',
      'Busungkan dada dan tarik handle ke arah dada bagian tengah-atas sambil menjaga siku tetap rapat di sisi tubuh.',
      'Kembalikan beban ke atas secara perlahan hingga bahu dan lats terasa teregang penuh.'
    ],
    tips: [
      'Jangan membungkukkan bahu saat handle menyentuh dada; jaga dada tetap terbuka.',
      'Biarkan tulang belikat naik sedikit di posisi paling atas untuk mendapatkan regangan maksimal.'
    ],
    commonMistakes: [
      'Menarik handle terlalu rendah hingga ke perut dengan siku mengarah ke atas.',
      'Melepaskan ketegangan secara tiba-tiba saat beban kembali ke atas.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=close+grip+lat+pulldown+form',
    alternatives: ['Wide-Grip Lat Pulldown Machine', 'Seated Cable Row']
  },
  {
    name: 'Seated Cable Row',
    primaryMuscle: MuscleGroup.BACK,
    secondaryMuscles: [MuscleGroup.BICEPS, MuscleGroup.SHOULDERS],
    equipment: EquipmentType.CABLE,
    weightIncrement: 5,
    steps: [
      'Duduk di mesin Cable Row, letakkan kaki di pijakan dengan lutut sedikit ditekuk (jangan dikunci lurus).',
      'Pegang V-handle, tegakkan punggung dengan dada membusung dan pandangan lurus ke depan.',
      'Tarik handle ke arah perut bagian bawah (pusar) sambil menjepit kedua tulang belikat di punggung tengah.',
      'Ulur kembali lengan ke depan secara perlahan tanpa membungkukkan punggung bawah secara berlebihan.'
    ],
    tips: [
      'Mulai setiap tarikan dengan menggerakkan bahu ke belakang terlebih dahulu sebelum menekuk siku.',
      'Tahan 1 detik saat handle menyentuh perut.'
    ],
    commonMistakes: [
      'Mengayunkan badan maju-mundur secara ekstrem menggunakan momentum pinggang.',
      'Bahu terangkat ke atas telinga saat menarik beban.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=seated+cable+row+form',
    alternatives: ['Chest-Supported Machine Row', 'Iso-Lateral High Row Machine (Plate Loaded)']
  },
  {
    name: 'Chest-Supported Machine Row',
    primaryMuscle: MuscleGroup.BACK,
    secondaryMuscles: [MuscleGroup.BICEPS, MuscleGroup.SHOULDERS],
    equipment: EquipmentType.MACHINE,
    weightIncrement: 5,
    steps: [
      'Atur tinggi kursi dan posisi bantalan dada sehingga dada bagian atas menempel nyaman dan tangan dapat meraih handle.',
      'Tempelkan dada pada bantalan selama gerakan berlangsung dan genggam handle (neutral atau pronated grip).',
      'Tarik handle ke belakang sejauh mungkin dengan mengarahkan siku ke belakang dan meremas punggung.',
      'Kembalikan beban perlahan hingga lengan lurus dan belikat tertarik ke depan.'
    ],
    tips: [
      'Karena dada ditopang bantalan, punggung bawah Anda bebas beban; fokuskan 100% tenaga pada kontraksi punggung atas dan lats.',
      'Gunakan genggaman horizontal untuk fokus punggung atas (upper back) atau vertikal untuk fokus lats.'
    ],
    commonMistakes: [
      'Mengangkat dada menjauh dari bantalan untuk memberi sentakan pada beban.',
      'Menekuk pergelangan tangan ke dalam saat menarik.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=chest+supported+machine+row+form',
    alternatives: ['Seated Cable Row', 'Iso-Lateral High Row Machine (Plate Loaded)']
  },
  {
    name: 'Iso-Lateral High Row Machine (Plate Loaded)',
    primaryMuscle: MuscleGroup.BACK,
    secondaryMuscles: [MuscleGroup.BICEPS],
    equipment: EquipmentType.PLATE_LOADED,
    weightIncrement: 5,
    steps: [
      'Pasang plate beban yang seimbang di kedua lengan mesin dan atur kursi agar paha terkunci di bawah bantalan.',
      'Pegang handle di atas depan Anda, busungkan dada di bantalan.',
      'Tarik handle ke arah bawah-belakang membentuk jalur melengkung hingga siku berada di samping pinggang.',
      'Kembalikan beban perlahan ke posisi awal sambil merasakan regangan di sayap punggung (lats).'
    ],
    tips: [
      'Anda bisa melakukannya satu tangan bergantian (unilateral) untuk rentang gerak dan fokus kontraksi yang lebih dalam.',
      'Tekan bahu ke bawah (depresi skapula) sebelum menarik siku.'
    ],
    commonMistakes: [
      'Memutar tubuh berlebihan saat menarik dengan satu tangan.',
      'Tidak menurunkan beban hingga posisi regangan penuh di atas.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=iso+lateral+high+row+machine+form',
    alternatives: ['Wide-Grip Lat Pulldown Machine', 'Chest-Supported Machine Row']
  },
  {
    name: 'Assisted Pull-Up Machine',
    primaryMuscle: MuscleGroup.BACK,
    secondaryMuscles: [MuscleGroup.BICEPS, MuscleGroup.ABS],
    equipment: EquipmentType.BODYWEIGHT,
    weightIncrement: 5,
    steps: [
      'Pilih beban bantuan pada pin stack (semakin besar angka beban yang dipilih, semakin ringan tarikan tubuh Anda).',
      'Pegang handle pull-up di atas, lalu letakkan kedua lutut atau telapak kaki di atas bantalan penopang.',
      'Dari posisi bergantung dengan lengan lurus, tarik tubuh ke atas hingga dagu melewati garis pegangan tangan.',
      'Turunkan tubuh kembali secara perlahan selama 2-3 detik hingga lengan lurus sempurna.'
    ],
    tips: [
      'Catat beban efektif Anda (Berat Badan dikurangi Beban Bantuan) atau catat beban bantuan secara konsisten untuk memantau progres.',
      'Jaga otot perut tetap kencang agar tubuh tidak berayun.'
    ],
    commonMistakes: [
      'Turun hanya setengah jalan dan tidak meluruskan lengan di bagian bawah.',
      'Melepaskan pijakan lutut secara mendadak saat masih ada beban di mesin.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=assisted+pull+up+machine+form',
    alternatives: ['Wide-Grip Lat Pulldown Machine', 'Close-Grip Neutral Lat Pulldown']
  },
  {
    name: 'Straight-Arm Cable Pulldown',
    primaryMuscle: MuscleGroup.BACK,
    secondaryMuscles: [MuscleGroup.TRICEPS, MuscleGroup.ABS],
    equipment: EquipmentType.CABLE,
    weightIncrement: 2.5,
    steps: [
      'Pasang palang lurus pendek atau tali (rope) pada katrol posisi paling atas.',
      'Pegang handle, mundur dua langkah, condongkan badan sekitar 30 derajat ke depan dengan punggung rata.',
      'Dengan lengan hampir lurus (siku hanya ditekuk sangat sedikit dan terkunci), tekan palang ke bawah membentuk busur hingga menyentuh paha.',
      'Rasakan kontraksi kuat di otot sayap (lats), lalu tahan saat palang kembali naik setinggi mata.'
    ],
    tips: [
      'Gerakan ini mengisolasi otot lats sepenuhnya tanpa bantuan bisep; gunakan beban moderat agar teknik tetap murni.',
      'Buang napas sambil mengencangkan otot perut saat palang menyentuh paha.'
    ],
    commonMistakes: [
      'Menekuk dan meluruskan siku sehingga gerakan berubah menjadi triceps pushdown.',
      'Berdiri terlalu tegak sehingga rentang gerak menjadi sangat pendek.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=straight+arm+cable+pulldown+form',
    alternatives: ['Wide-Grip Lat Pulldown Machine', 'Iso-Lateral High Row Machine (Plate Loaded)']
  },

  // ==================== 3. BAHU / SHOULDERS (6 Gerakan) ====================
  {
    name: 'Seated Overhead Shoulder Press Machine',
    primaryMuscle: MuscleGroup.SHOULDERS,
    secondaryMuscles: [MuscleGroup.TRICEPS],
    equipment: EquipmentType.MACHINE,
    weightIncrement: 5,
    steps: [
      'Atur tinggi kursi agar pegangan mesin berada tepat setinggi bahu atau telinga bagian bawah.',
      'Duduk tegak dengan punggung menempel rapat pada sandaran dan kaki menapak stabil di lantai.',
      'Dorong pegangan vertikal ke atas kepala sambil membuang napas hingga lengan hampir lurus.',
      'Turunkan beban kembali secara terkontrol hingga pegangan sejajar dengan dagu atau bahu.'
    ],
    tips: [
      'Pilih pegangan netral (telapak berhadapan) jika Anda memiliki riwayat nyeri bahu karena posisi ini lebih ramah bagi sendi.',
      'Kencangkan otot perut agar punggung bawah tidak melengkung berlebihan.'
    ],
    commonMistakes: [
      'Melengkungkan punggung bawah terlalu ekstrem sehingga mengubah gerakan menjadi incline chest press.',
      'Mengunci siku dengan keras di puncak gerakan.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=shoulder+press+machine+form',
    alternatives: ['Smith Machine Overhead Press', 'Lateral Raise Machine']
  },
  {
    name: 'Lateral Raise Machine',
    primaryMuscle: MuscleGroup.SHOULDERS,
    secondaryMuscles: [],
    equipment: EquipmentType.MACHINE,
    weightIncrement: 2.5,
    steps: [
      'Atur kursi sehingga poros putaran mesin sejajar dengan sendi bahu Anda.',
      'Tempelkan lengan bagian luar/siku pada bantalan mesin dengan siku ditekuk sekitar 90 derajat.',
      'Angkat kedua siku ke samping hingga sejajar dengan tinggi bahu (paralel dengan lantai).',
      'Tahan 1 detik di atas, lalu turunkan kembali secara perlahan tanpa membiarkan tumpukan beban menyentuh dasar.'
    ],
    tips: [
      'Dorong bantalan menggunakan siku Anda, bukan menggunakan telapak tangan atau pergelangan tangan.',
      'Jaga bahu tetap rileks di bawah (jangan mengangkat bahu/shrug).'
    ],
    commonMistakes: [
      'Mengangkat siku terlalu tinggi melewati garis bahu sehingga beban diambil alih oleh otot traps.',
      'Mengayunkan tubuh untuk mengangkat beban yang terlalu berat.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=lateral+raise+machine+form',
    alternatives: ['Cable Lateral Raise', 'Seated Overhead Shoulder Press Machine']
  },
  {
    name: 'Cable Lateral Raise',
    primaryMuscle: MuscleGroup.SHOULDERS,
    secondaryMuscles: [],
    equipment: EquipmentType.CABLE,
    weightIncrement: 2.5,
    steps: [
      'Atur katrol di posisi paling bawah dan pasang single D-handle.',
      'Berdiri menyamping dari mesin, pegang tiang mesin dengan tangan bagian dalam untuk stabilitas, dan pegang handle dengan tangan bagian luar.',
      'Dengan siku sedikit ditekuk, angkat lengan ke samping hingga setinggi bahu.',
      'Turunkan lengan secara perlahan melawan tarikan kabel hingga kembali ke samping paha.'
    ],
    tips: [
      'Anda bisa melewatkan kabel di belakang punggung (behind-the-back) untuk mendapatkan regangan awal yang lebih kuat pada bahu samping.',
      'Fokus pada tempo negatif (saat turun) selama 2-3 detik.'
    ],
    commonMistakes: [
      'Menarik kabel dengan mengayunkan pinggul.',
      'Memutar ibu jari terlalu ke atas sehingga bahu depan lebih dominan bekerja.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=cable+lateral+raise+form',
    alternatives: ['Lateral Raise Machine', 'Cable Face Pull']
  },
  {
    name: 'Reverse Pec Deck (Rear Delt Fly Machine)',
    primaryMuscle: MuscleGroup.SHOULDERS,
    secondaryMuscles: [MuscleGroup.BACK],
    equipment: EquipmentType.MACHINE,
    weightIncrement: 2.5,
    steps: [
      'Atur lengan mesin Pec Deck ke posisi paling belakang dan sesuaikan kursi agar pegangan sejajar dengan bahu.',
      'Duduk menghadap sandaran mesin dengan dada menempel pada bantalan.',
      'Pegang handle dengan lengan hampir lurus, lalu buka kedua lengan ke samping-belakang sejauh mungkin.',
      'Tahan sejenak di posisi terbuka untuk mengontraksikan bahu belakang (rear delt), lalu kembali perlahan.'
    ],
    tips: [
      'Bayangkan Anda sedang mendorong dinding ke samping, bukan menjepit tulang belikat ke tengah punggung.',
      'Gunakan genggaman netral atau telapak menghadap ke bawah untuk meminimalkan keterlibatan otot traps tengah.'
    ],
    commonMistakes: [
      'Menekuk siku terlalu banyak sehingga gerakan berubah menjadi row punggung.',
      'Menggunakan beban terlalu berat hingga kepala dan leher menegang.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=reverse+pec+deck+rear+delt+form',
    alternatives: ['Cable Face Pull', 'Chest-Supported Machine Row']
  },
  {
    name: 'Cable Face Pull',
    primaryMuscle: MuscleGroup.SHOULDERS,
    secondaryMuscles: [MuscleGroup.BACK],
    equipment: EquipmentType.CABLE,
    weightIncrement: 2.5,
    steps: [
      'Pasang tali (rope attachment) pada katrol setinggi wajah atau dahi.',
      'Pegang ujung tali dengan ibu jari mengarah ke belakang, lalu mundur dua langkah hingga kabel menegang.',
      'Tarik tali ke arah dahi sambil membuka kedua tangan ke samping telinga dan memutar bahu ke luar (external rotation).',
      'Tahan 1 detik di posisi akhir, lalu kembalikan lengan ke depan secara terkontrol.'
    ],
    tips: [
      'Gerakan ini sangat penting untuk kesehatan rotator cuff dan postur bahu.',
      'Pastikan siku tetap berada tinggi sejajar bahu saat menarik tali.'
    ],
    commonMistakes: [
      'Menarik tali ke arah dagu atau leher bawah dengan siku turun.',
      'Memasang beban terlalu berat sehingga tubuh tertarik ke depan.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=cable+face+pull+form',
    alternatives: ['Reverse Pec Deck (Rear Delt Fly Machine)', 'Cable Lateral Raise']
  },
  {
    name: 'Smith Machine Overhead Press',
    primaryMuscle: MuscleGroup.SHOULDERS,
    secondaryMuscles: [MuscleGroup.TRICEPS],
    equipment: EquipmentType.SMITH_MACHINE,
    weightIncrement: 5,
    steps: [
      'Letakkan bangku tegak (sandaran 75-85 derajat) di tengah Smith Machine sehingga palang turun tepat di depan dagu.',
      'Pegang palang sedikit lebih lebar dari bahu, buka pengait pengaman.',
      'Turunkan palang secara perlahan hingga setinggi dagu atau bawah hidung.',
      'Dorong palang kembali ke atas hingga lengan hampir lurus.'
    ],
    tips: [
      'Kemiringan sandaran sekitar 80 derajat jauh lebih nyaman untuk sendi bahu dibandingkan posisi 90 derajat tegak lurus.',
      'Jaga siku berada sedikit di depan palang (scapular plane), bukan melebar lurus ke samping.'
    ],
    commonMistakes: [
      'Duduk terlalu jauh dari palang sehingga beban berada terlalu jauh di depan tubuh.',
      'Menurunkan palang ke belakang leher.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=smith+machine+shoulder+press+form',
    alternatives: ['Seated Overhead Shoulder Press Machine', 'Incline Chest Press Machine']
  },

  // ==================== 4. BISEP / BICEPS (5 Gerakan) ====================
  {
    name: 'Preacher Curl Machine',
    primaryMuscle: MuscleGroup.BICEPS,
    secondaryMuscles: [MuscleGroup.FOREARMS],
    equipment: EquipmentType.MACHINE,
    weightIncrement: 2.5,
    steps: [
      'Atur kursi sehingga ketiak dan seluruh lengan atas menempel penuh di atas bantalan miring (preacher pad).',
      'Pegang handle dengan telapak tangan menghadap ke atas (underhand grip).',
      'Angkat handle ke arah bahu dengan mengontraksikan otot bisep tanpa mengangkat siku dari bantalan.',
      'Turunkan beban kembali secara perlahan hingga lengan hampir lurus penuh.'
    ],
    tips: [
      'Jangan membanting beban di titik paling bawah karena tendon bisep berada dalam posisi terentang maksimal.',
      'Peras bisep selama 1 detik di puncak gerakan.'
    ],
    commonMistakes: [
      'Mengangkat siku dari bantalan dan berdiri sedikit untuk membantu mengangkat beban.',
      'Hanya menurunkan beban setengah jalan.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=preacher+curl+machine+form',
    alternatives: ['Cable Bicep Curl (EZ-Bar / Straight Bar)', 'Bayesian Cable Curl']
  },
  {
    name: 'Cable Bicep Curl (EZ-Bar / Straight Bar)',
    primaryMuscle: MuscleGroup.BICEPS,
    secondaryMuscles: [MuscleGroup.FOREARMS],
    equipment: EquipmentType.CABLE,
    weightIncrement: 2.5,
    steps: [
      'Pasang palang EZ-bar atau palang lurus pada katrol posisi paling bawah.',
      'Berdiri tegak menghadap mesin, genggam palang selebar bahu dengan telapak tangan menghadap ke atas.',
      'Kunci siku di samping tulang rusuk, lalu angkat palang ke atas menuju dada atas sambil membuang napas.',
      'Turunkan palang perlahan selama 2-3 detik hingga lengan lurus kembali.'
    ],
    tips: [
      'Keunggulan kabel dibanding dumbbell adalah ketegangan (tension) yang konstan dari bawah hingga puncak gerakan.',
      'Gunakan EZ-bar jika pergelangan tangan terasa kurang nyaman menggunakan palang lurus.'
    ],
    commonMistakes: [
      'Menggerakkan siku maju ke depan untuk mengangkat beban.',
      'Mengayunkan punggung bawah di setiap repetisi.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=cable+bicep+curl+form',
    alternatives: ['Preacher Curl Machine', 'Cable Rope Hammer Curl']
  },
  {
    name: 'Cable Rope Hammer Curl',
    primaryMuscle: MuscleGroup.BICEPS,
    secondaryMuscles: [MuscleGroup.FOREARMS],
    equipment: EquipmentType.CABLE,
    weightIncrement: 2.5,
    steps: [
      'Pasang tali (rope attachment) pada katrol bawah.',
      'Pegang tali dengan genggaman netral (kedua telapak tangan saling berhadapan, ibu jari di bagian atas tali).',
      'Dengan siku tetap rapat di sisi tubuh, tarik tali ke atas ke arah bahu.',
      'Tahan kontraksi di puncak, lalu turunkan kembali secara terkontrol.'
    ],
    tips: [
      'Gerakan ini sangat efektif menebalkan lengan karena menargetkan otot brachialis dan brachioradialis.',
      'Jaga pergelangan tangan tetap lurus dan kokoh sepanjang set.'
    ],
    commonMistakes: [
      'Memutar pergelangan tangan di tengah gerakan.',
      'Membiarkan bahu membungkuk ke depan.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=cable+rope+hammer+curl+form',
    alternatives: ['Cable Bicep Curl (EZ-Bar / Straight Bar)', 'Preacher Curl Machine']
  },
  {
    name: 'Bayesian Cable Curl (Single-Arm Behind Back)',
    primaryMuscle: MuscleGroup.BICEPS,
    secondaryMuscles: [MuscleGroup.FOREARMS],
    equipment: EquipmentType.CABLE,
    weightIncrement: 2.5,
    steps: [
      'Pasang single D-handle pada katrol paling bawah, lalu berdiri membelakangi mesin.',
      'Langkahkan satu kaki ke depan hingga lengan yang memegang handle tertarik sedikit ke belakang tubuh.',
      'Jaga siku tetap berada di belakang garis tubuh, lalu tekuk lengan ke depan-atas sambil mengontraksikan bisep.',
      'Turunkan kembali perlahan hingga lengan lurus di belakang tubuh dan bisep terasa teregang penuh.'
    ],
    tips: [
      'Memberikan regangan puncak pada long head bisep yang sangat efektif memicu hipertrofi.',
      'Hindari mengayunkan bahu ke depan di awal angkatan.'
    ],
    commonMistakes: [
      'Berdiri terlalu dekat dengan katrol sehingga kabel kendur di bagian bawah.',
      'Membawa siku terlalu jauh ke depan dada.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=bayesian+cable+curl+form',
    alternatives: ['Preacher Curl Machine', 'Cable Bicep Curl (EZ-Bar / Straight Bar)']
  },
  {
    name: 'High-Pulley Overhead Cable Curl',
    primaryMuscle: MuscleGroup.BICEPS,
    secondaryMuscles: [MuscleGroup.FOREARMS],
    equipment: EquipmentType.CABLE,
    weightIncrement: 2.5,
    steps: [
      'Atur kedua katrol di posisi atas dan pasang single D-handle di kiri serta kanan.',
      'Berdiri tepat di tengah mesin dengan kedua lengan direntangkan sejajar bahu.',
      'Jaga lengan atas tetap sejajar lantai, lalu tekuk kedua siku menarik handle ke arah samping kepala (seperti pose double front bicep).',
      'Peras puncak bisep 1 detik, lalu luruskan kembali lengan secara terkontrol.'
    ],
    tips: [
      'Sangat baik sebagai gerakan penutup (finisher) untuk melatih kontraksi puncak (peak contraction) bisep.',
      'Gunakan beban ringan-menengah agar siku tidak turun.'
    ],
    commonMistakes: [
      'Menurunkan siku ke arah tulang rusuk saat menarik beban.',
      'Menarik beban dengan membungkukkan badan.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=high+pulley+cable+curl+form',
    alternatives: ['Preacher Curl Machine', 'Cable Bicep Curl (EZ-Bar / Straight Bar)']
  },

  // ==================== 5. TRISEP / TRICEPS (4 Gerakan) ====================
  {
    name: 'Tricep Rope Pushdown (Cable)',
    primaryMuscle: MuscleGroup.TRICEPS,
    secondaryMuscles: [],
    equipment: EquipmentType.CABLE,
    weightIncrement: 2.5,
    steps: [
      'Pasang tali (rope) pada katrol atas dan berdiri tegak dengan badan sedikit condong ke depan.',
      'Kunci kedua siku rapat di samping tubuh sebagai engsel tetap.',
      'Dorong tali ke bawah hingga lengan lurus sempurna dan buka sedikit ujung tali ke samping di bagian bawah.',
      'Kembalikan tali ke atas secara perlahan hingga lengan bawah dan lengan atas membentuk sudut sekitar 90 derajat.'
    ],
    tips: [
      'Hanya sendi siku yang boleh bergerak; bahu dan lengan atas harus diam sepenuhnya.',
      'Tahan 1 detik saat lengan lurus di bawah untuk kontraksi maksimal kepala lateral trisep.'
    ],
    commonMistakes: [
      'Siku ikut naik-turun dan maju-mundur sehingga gerakan dibantu oleh dada dan bahu.',
      'Berdiri terlalu dekat atau menindih kabel dengan berat badan.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=tricep+rope+pushdown+form',
    alternatives: ['Overhead Cable Tricep Extension', 'Seated Dip Machine (Tricep Press)']
  },
  {
    name: 'Overhead Cable Tricep Extension',
    primaryMuscle: MuscleGroup.TRICEPS,
    secondaryMuscles: [],
    equipment: EquipmentType.CABLE,
    weightIncrement: 2.5,
    steps: [
      'Pasang tali pada katrol setinggi pinggang atau bawah, lalu berbalik membelakangi mesin.',
      'Pegang tali di belakang kepala, langkahkan satu kaki ke depan untuk kuda-kuda yang stabil, dan condongkan badan sedikit.',
      'Dengan siku mengarah ke depan-atas, luruskan lengan ke atas kepala hingga trisep berkontraksi penuh.',
      'Tekuk kembali siku secara perlahan hingga terasa regangan dalam di bagian belakang lengan.'
    ],
    tips: [
      'Posisi lengan di atas kepala memberikan regangan maksimal pada bagian long head (kepala panjang) otot trisep.',
      'Jaga kedua siku tidak membuka terlalu lebar ke samping.'
    ],
    commonMistakes: [
      'Melengkungkan punggung bawah secara berlebihan.',
      'Tidak menurunkan beban cukup dalam di belakang kepala.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=overhead+cable+tricep+extension+form',
    alternatives: ['Tricep Rope Pushdown (Cable)', 'Seated Dip Machine (Tricep Press)']
  },
  {
    name: 'Seated Dip Machine (Tricep Press)',
    primaryMuscle: MuscleGroup.TRICEPS,
    secondaryMuscles: [MuscleGroup.CHEST, MuscleGroup.SHOULDERS],
    equipment: EquipmentType.MACHINE,
    weightIncrement: 5,
    steps: [
      'Duduk di mesin Dip, pasang sabuk pengaman jika tersedia agar pinggul tidak terangkat saat mendorong beban berat.',
      'Pegang handle dengan genggaman sempit dan jaga siku tetap rapat mengarah ke belakang.',
      'Dorong handle ke bawah hingga lengan lurus sambil membuang napas.',
      'Tekuk siku perlahan hingga sudut 90 derajat sambil menjaga bahu tetap turun (tidak terangkat ke telinga).'
    ],
    tips: [
      'Duduk tegak untuk memfokuskan beban ke trisep, atau condongkan badan sedikit ke depan jika ingin melibatkan dada bawah.',
      'Pastikan bahu tidak terangkat saat beban kembali naik.'
    ],
    commonMistakes: [
      'Membiarkan siku kembali naik terlalu tinggi hingga bahu tertekan ke atas.',
      'Melebar siku keluar sehingga mengurangi kerja trisep.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=seated+dip+machine+triceps+form',
    alternatives: ['Tricep Rope Pushdown (Cable)', 'Decline Chest Press Machine']
  },
  {
    name: 'V-Bar Cable Tricep Pushdown',
    primaryMuscle: MuscleGroup.TRICEPS,
    secondaryMuscles: [],
    equipment: EquipmentType.CABLE,
    weightIncrement: 2.5,
    steps: [
      'Pasang V-Bar besi pada katrol atas dan berdiri tegak menghadap mesin.',
      'Pegang V-Bar dengan telapak tangan menghadap bawah-dalam, kunci siku di samping rusuk.',
      'Tekan V-Bar ke bawah hingga siku lurus penuh sambil membuang napas.',
      'Tahan sejenak di bawah, lalu biarkan V-Bar naik kembali secara terkontrol setinggi dada bawah.'
    ],
    tips: [
      'Pegangan V-Bar memungkinkan Anda mendorong beban sedikit lebih berat dibandingkan tali (rope) dengan posisi pergelangan yang ergonomis.',
      'Jaga bahu tetap ditekan ke bawah sepanjang set.'
    ],
    commonMistakes: [
      'Mencondongkan badan terlalu jauh ke atas palang dan menekan dengan berat badan.',
      'Pergelangan tangan menekuk ke atas di akhir repetisi.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=v+bar+tricep+pushdown+form',
    alternatives: ['Tricep Rope Pushdown (Cable)', 'Seated Dip Machine (Tricep Press)']
  },

  // ==================== 6. KAKI & BOKONG / LEGS & GLUTES (10 Gerakan) ====================
  {
    name: '45-Degree Leg Press Machine',
    primaryMuscle: MuscleGroup.QUADS,
    secondaryMuscles: [MuscleGroup.GLUTES, MuscleGroup.HAMSTRINGS],
    equipment: EquipmentType.PLATE_LOADED,
    weightIncrement: 10,
    steps: [
      'Duduk di mesin Leg Press dengan punggung bawah dan bokong menempel rapat pada bantalan kursi.',
      'Letakkan kedua telapak kaki selebar bahu di tengah papan pijakan.',
      'Dorong papan sedikit untuk membuka tuas pengaman di samping, lalu turunkan beban perlahan dengan menekuk lutut ke arah dada.',
      'Berhenti sesaat sebelum punggung bawah/bokong terangkat dari bantalan, lalu dorong kembali menggunakan tumit dan tengah telapak kaki (jangan mengunci lutut sampai lurus patah).'
    ],
    tips: [
      'Posisi kaki lebih rendah di papan pijakan akan lebih menargetkan paha depan (quads), sedangkan posisi kaki lebih tinggi lebih menargetkan glutes dan hamstring.',
      'Jangan pernah meletakkan tangan di lutut untuk ikut mendorong; pegang handle di samping kursi.'
    ],
    commonMistakes: [
      'Mengunci lutut secara penuh (hyperextension) di puncak dorongan yang sangat berbahaya bagi sendi lutut.',
      'Menurunkan beban terlalu dalam hingga bokong terangkat dan punggung bawah membungkuk.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=45+degree+leg+press+machine+form',
    alternatives: ['Hack Squat Machine', 'Horizontal Seated Leg Press Machine']
  },
  {
    name: 'Horizontal Seated Leg Press Machine',
    primaryMuscle: MuscleGroup.QUADS,
    secondaryMuscles: [MuscleGroup.GLUTES, MuscleGroup.HAMSTRINGS],
    equipment: EquipmentType.MACHINE,
    weightIncrement: 5,
    steps: [
      'Duduk di mesin Horizontal Leg Press dan atur jarak kursi sehingga lutut membentuk sudut sekitar 90 derajat saat kaki di papan pijakan.',
      'Pilih beban pada pin stack, pegang handle di samping kursi, dan busungkan dada.',
      'Dorong papan pijakan atau kursi ke belakang dengan bertumpu pada seluruh telapak kaki hingga kaki hampir lurus.',
      'Kembalikan secara perlahan tanpa membiarkan tumpukan beban berbenturan.'
    ],
    tips: [
      'Sangat aman bagi pemula maupun latihan cepat karena menggunakan sistem pin stack tanpa perlu bongkar-pasang plate.',
      'Jaga lutut tetap sejajar dengan arah jari-jari kaki.'
    ],
    commonMistakes: [
      'Mengunci lutut dengan hentakan keras di akhir dorongan.',
      'Mengangkat tumit sehingga beban hanya bertumpu pada ujung jari kaki.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=horizontal+seated+leg+press+machine+form',
    alternatives: ['45-Degree Leg Press Machine', 'Hack Squat Machine']
  },
  {
    name: 'Hack Squat Machine',
    primaryMuscle: MuscleGroup.QUADS,
    secondaryMuscles: [MuscleGroup.GLUTES],
    equipment: EquipmentType.PLATE_LOADED,
    weightIncrement: 10,
    steps: [
      'Masuk ke mesin Hack Squat, tempelkan punggung pada sandaran dan posisikan bahu di bawah bantalan bahu.',
      'Letakkan kaki selebar bahu di pijakan, luruskan kaki sedikit untuk melepas tuas pengaman.',
      'Turunkan tubuh secara terkontrol hingga paha sejajar atau sedikit lebih rendah dari sejajar papan pijakan.',
      'Dorong kembali ke atas dengan kuat sambil menjaga lutut tetap searah dengan jari kaki.'
    ],
    tips: [
      'Hack Squat memberikan stabilitas punggung yang luar biasa sehingga sangat aman untuk melatih paha depan hingga mendekati failure.',
      'Tarik napas dalam dan kencangkan perut (bracing) sebelum mulai turun.'
    ],
    commonMistakes: [
      'Lutut masuk ke arah dalam (knee valgus) saat mendorong beban ke atas.',
      'Tumit terangkat dari papan pijakan karena posisi kaki terlalu mundur.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=hack+squat+machine+form',
    alternatives: ['45-Degree Leg Press Machine', 'Smith Machine Squat']
  },
  {
    name: 'Seated Leg Extension Machine',
    primaryMuscle: MuscleGroup.QUADS,
    secondaryMuscles: [],
    equipment: EquipmentType.MACHINE,
    weightIncrement: 5,
    steps: [
      'Atur sandaran kursi agar lipatan belakang lutut pas berada di tepi kursi dan poros putaran mesin sejajar dengan lutut.',
      'Atur bantalan rol agar berada tepat di atas pergelangan kaki bagian depan.',
      'Pegang handle samping untuk mengunci bokong tetap di kursi, lalu luruskan kedua kaki ke atas hingga maksimal.',
      'Tahan kontraksi paha depan selama 1 detik di atas, lalu turunkan kembali secara perlahan.'
    ],
    tips: [
      'Arahkan ujung jari kaki ke atas (dorsiflexion) selama gerakan untuk kontraksi paha depan yang lebih tajam.',
      'Jangan biarkan bokong terangkat dari kursi saat mengangkat beban.'
    ],
    commonMistakes: [
      'Mengayunkan kaki dengan cepat menggunakan momentum tanpa menahan di puncak gerakan.',
      'Bantalan rol diletakkan terlalu tinggi di tulang kering atau terlalu rendah di punggung kaki.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=seated+leg+extension+machine+form',
    alternatives: ['Hack Squat Machine', '45-Degree Leg Press Machine']
  },
  {
    name: 'Seated Leg Curl Machine',
    primaryMuscle: MuscleGroup.HAMSTRINGS,
    secondaryMuscles: [MuscleGroup.CALVES],
    equipment: EquipmentType.MACHINE,
    weightIncrement: 5,
    steps: [
      'Atur sandaran kursi dan letakkan pergelangan kaki bagian belakang di atas bantalan rol bawah.',
      'Turunkan bantalan pengunci paha tepat di atas lutut dengan kencang agar paha tidak bergerak.',
      'Tekuk lutut dengan menarik tumit ke arah bawah kursi sejauh mungkin sambil membuang napas.',
      'Tahan 1 detik di bawah, lalu kembalikan kaki ke posisi lurus secara perlahan.'
    ],
    tips: [
      'Condongkan badan sedikit ke depan dari pinggul untuk memberikan regangan awal yang lebih optimal pada otot hamstring.',
      'Seated Leg Curl terbukti secara biomekanik memberikan hipertrofi hamstring yang sangat tinggi karena posisi pinggul yang tertekuk.'
    ],
    commonMistakes: [
      'Memasang bantalan pengunci paha terlalu longgar sehingga paha ikut terangkat.',
      'Melepas beban terlalu cepat saat kaki kembali lurus.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=seated+leg+curl+machine+form',
    alternatives: ['Lying Leg Curl Machine', 'Smith Machine Romanian Deadlift (RDL)']
  },
  {
    name: 'Lying Leg Curl Machine',
    primaryMuscle: MuscleGroup.HAMSTRINGS,
    secondaryMuscles: [MuscleGroup.CALVES, MuscleGroup.GLUTES],
    equipment: EquipmentType.MACHINE,
    weightIncrement: 5,
    steps: [
      'Berbaring tengkurap di mesin dengan tempurung lutut berada sedikit di luar tepi bantalan dan rol berada di belakang pergelangan kaki.',
      'Pegang handle di depan dan tekan pinggul/panggul ke bantalan sepanjang set.',
      'Tekuk kedua kaki ke atas mendekati bokong sambil mengontraksikan hamstring.',
      'Turunkan beban kembali secara terkontrol hingga kaki hampir lurus.'
    ],
    tips: [
      'Tekan panggul ke bawah ke arah bangku saat menekuk kaki agar pinggul tidak terangkat.',
      'Kontrol fase turun selama 2-3 detik.'
    ],
    commonMistakes: [
      'Mengangkat bokong tinggi-tinggi saat menarik beban karena beban terlalu berat.',
      'Melengkungkan punggung bawah secara paksa.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=lying+leg+curl+machine+form',
    alternatives: ['Seated Leg Curl Machine', 'Smith Machine Romanian Deadlift (RDL)']
  },
  {
    name: 'Smith Machine Squat',
    primaryMuscle: MuscleGroup.QUADS,
    secondaryMuscles: [MuscleGroup.GLUTES, MuscleGroup.HAMSTRINGS],
    equipment: EquipmentType.SMITH_MACHINE,
    weightIncrement: 5,
    steps: [
      'Posisikan palang Smith Machine di atas otot punggung atas (traps), bukan di tulang leher.',
      'Berdiri dengan kaki selebar bahu dan posisikan telapak kaki sedikit di depan garis vertikal palang.',
      'Putar palang untuk membuka pengait, tarik napas, dan turunkan pinggul ke belakang-bawah hingga paha sejajar lantai.',
      'Dorong lantai dengan tumit dan tengah kaki untuk kembali berdiri tegak.'
    ],
    tips: [
      'Menempatkan kaki sedikit lebih maju memungkinkan punggung tetap lebih tegak dan memberi tekanan lebih besar pada quads atau glutes.',
      'Selalu pasang safety stopper di kiri dan kanan mesin.'
    ],
    commonMistakes: [
      'Berdiri tepat lurus di bawah palang seperti barbell bebas sehingga pergerakan terasa kaku.',
      'Membungkukkan punggung bawah di titik terbawah.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=smith+machine+squat+form',
    alternatives: ['Hack Squat Machine', '45-Degree Leg Press Machine']
  },
  {
    name: 'Smith Machine Romanian Deadlift (RDL)',
    primaryMuscle: MuscleGroup.HAMSTRINGS,
    secondaryMuscles: [MuscleGroup.GLUTES, MuscleGroup.BACK],
    equipment: EquipmentType.SMITH_MACHINE,
    weightIncrement: 5,
    steps: [
      'Atur palang setinggi paha atas, genggam selebar bahu, dan berdiri tegak dengan kaki selebar pinggul.',
      'Tekuk lutut sedikit saja (soft knees) dan kunci sudut lutut tersebut.',
      'Dorong bokong jauh ke belakang (hip hinge) sambil menurunkan palang menyusuri paha hingga pertengahan tulang kering.',
      'Saat hamstring terasa sangat teregang, dorong pinggul kembali ke depan hingga berdiri tegak.'
    ],
    tips: [
      'Bayangkan Anda sedang menutup pintu mobil menggunakan bokong Anda.',
      'Berhenti menurunkan palang tepat saat bokong tidak bisa lagi terdorong ke belakang agar beban tidak pindah ke punggung bawah.'
    ],
    commonMistakes: [
      'Menurunkan palang terlalu rendah sampai ke lantai dengan cara membungkukkan punggung.',
      'Menekuk lutut terlalu banyak sehingga berubah menjadi gerakan squat.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=smith+machine+rdl+form',
    alternatives: ['Seated Leg Curl Machine', 'Hip Thrust Machine / Smith Machine Hip Thrust']
  },
  {
    name: 'Hip Thrust Machine / Smith Machine Hip Thrust',
    primaryMuscle: MuscleGroup.GLUTES,
    secondaryMuscles: [MuscleGroup.HAMSTRINGS],
    equipment: EquipmentType.MACHINE,
    weightIncrement: 10,
    steps: [
      'Sandarkan punggung atas (tepat di bawah tulang belikat) pada bantalan sandaran dan pasang sabuk/bantalan beban di atas lipatan pinggul.',
      'Letakkan telapak kaki selebar bahu sehingga saat di posisi atas, tulang kering tegak lurus (90 derajat) terhadap lantai.',
      'Dorong pinggul ke atas melalui tumit hingga tubuh sejajar dari bahu ke lutut.',
      'Peras otot bokong (glutes) selama 1-2 detik di atas sambil menjaga dagu menunduk, lalu turunkan pinggul perlahan.'
    ],
    tips: [
      'Jaga pandangan selalu ke arah depan dan dagu sedikit menunduk (chin tuck) untuk mencegah punggung bawah melengkung.',
      'Dorong beban menggunakan tumit, bukan ujung jari kaki.'
    ],
    commonMistakes: [
      'Kaki terlalu dekat (dominan quads) atau terlalu jauh (dominan hamstring).',
      'Mendongakkan kepala ke belakang saat mendorong beban ke atas.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=hip+thrust+machine+form',
    alternatives: ['Hip Abduction Machine', 'Smith Machine Romanian Deadlift (RDL)']
  },
  {
    name: 'Hip Abduction Machine',
    primaryMuscle: MuscleGroup.GLUTES,
    secondaryMuscles: [],
    equipment: EquipmentType.MACHINE,
    weightIncrement: 5,
    steps: [
      'Duduk di mesin Hip Abduction dengan paha bagian luar menempel pada bantalan samping.',
      'Pegang handle samping dan dorong kedua lutut membuka ke arah luar sejauh mungkin.',
      'Tahan kontraksi di bokong samping (gluteus medius) selama 1 detik.',
      'Kembalikan paha ke posisi rapat secara perlahan tanpa membanting beban.'
    ],
    tips: [
      'Duduk tegak atau sedikit condong ke depan sambil berpegangan pada kerangka depan mesin untuk aktivasi glutes atas yang lebih baik.',
      'Gunakan tempo terkontrol di setiap repetisi.'
    ],
    commonMistakes: [
      'Mengayunkan kaki membuka-menutup terlalu cepat dengan momentum.',
      'Mengangkat telapak kaki keluar dari pijakan mesin.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=hip+abduction+machine+form',
    alternatives: ['Hip Thrust Machine / Smith Machine Hip Thrust', '45-Degree Leg Press Machine']
  },

  // ==================== 7. BETIS / CALVES (3 Gerakan) ====================
  {
    name: 'Standing Calf Raise Machine',
    primaryMuscle: MuscleGroup.CALVES,
    secondaryMuscles: [],
    equipment: EquipmentType.MACHINE,
    weightIncrement: 5,
    steps: [
      'Tempatkan bahu di bawah bantalan mesin dan letakkan bagian depan telapak kaki (bola kaki) di atas pijakan dengan tumit menggantung.',
      'Luruskan lutut dan pinggul untuk mengangkat beban dari penyangga.',
      'Turunkan tumit sejauh mungkin ke bawah hingga otot betis terasa teregang penuh selama 2 detik.',
      'Angkat tumit setinggi mungkin (jinjit maksimal) dan tahan 1 detik di puncak sebelum turun kembali.'
    ],
    tips: [
      'Jeda 1-2 detik di posisi paling bawah sangat penting untuk menghilangkan efek pegas dari tendon Achilles sehingga otot betis bekerja murni.',
      'Jaga lutut tetap lurus (namun tidak terkunci kaku) agar otot gastrocnemius bekerja maksimal.'
    ],
    commonMistakes: [
      'Memantul-mantulkan beban dengan cepat dan rentang gerak sangat pendek.',
      'Menekuk lutut untuk membantu mengangkat beban.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=standing+calf+raise+machine+form',
    alternatives: ['Seated Calf Raise Machine', 'Leg Press Calf Raise']
  },
  {
    name: 'Seated Calf Raise Machine',
    primaryMuscle: MuscleGroup.CALVES,
    secondaryMuscles: [],
    equipment: EquipmentType.MACHINE,
    weightIncrement: 5,
    steps: [
      'Duduk di mesin dan letakkan bola telapak kaki di tepi pijakan bawah.',
      'Kunci bantalan paha tepat di atas lutut bagian bawah.',
      'Angkat sedikit dengan jinjit untuk melepas tuas penyangga, lalu turunkan tumit sedalam mungkin.',
      'Dorong kembali ke atas hingga kontraksi penuh pada betis.'
    ],
    tips: [
      'Karena posisi lutut ditekuk 90 derajat, gerakan ini secara spesifik menargetkan otot soleus (bagian dalam/samping betis).',
      'Kombinasikan dengan Standing Calf Raise untuk perkembangan betis yang lengkap.'
    ],
    commonMistakes: [
      'Menggunakan tangan untuk ikut mengangkat bantalan paha.',
      'Tidak menahan fase regangan di bagian bawah.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=seated+calf+raise+machine+form',
    alternatives: ['Standing Calf Raise Machine', 'Leg Press Calf Raise']
  },
  {
    name: 'Leg Press Calf Raise',
    primaryMuscle: MuscleGroup.CALVES,
    secondaryMuscles: [],
    equipment: EquipmentType.PLATE_LOADED,
    weightIncrement: 10,
    steps: [
      'Duduk di mesin Leg Press dan letakkan hanya bagian depan telapak kaki di tepi paling bawah papan pijakan.',
      'Dorong papan hingga kaki lurus (biarkan tuas pengaman mesin tetap terkunci atau siap dikunci jika ragu).',
      'Biarkan papan menekan jari kaki ke arah Anda hingga betis teregang maksimal.',
      'Dorong papan menggunakan bola kaki sejauh mungkin seperti gerakan menginjak pedal gas.'
    ],
    tips: [
      'Pastikan telapak sepatu tidak licin agar kaki tidak tergelincir dari tepi bawah papan.',
      'Lakukan dengan tempo lambat dan terkontrol.'
    ],
    commonMistakes: [
      'Menempatkan kaki terlalu di ujung hingga berisiko terpleset.',
      'Mengunci lutut sampai melengkung ke belakang.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=leg+press+calf+raise+form',
    alternatives: ['Standing Calf Raise Machine', 'Seated Calf Raise Machine']
  },

  // ==================== 8. PERUT / ABS (3 Gerakan) ====================
  {
    name: 'Abdominal Crunch Machine',
    primaryMuscle: MuscleGroup.ABS,
    secondaryMuscles: [],
    equipment: EquipmentType.MACHINE,
    weightIncrement: 5,
    steps: [
      'Duduk di mesin Crunch, kaitkan kaki di bantalan bawah (jika ada) dan pegang handle di samping kepala atau dada.',
      'Buang napas sambil menggulung tulang belakang bagian atas ke arah panggul (mendekatkan tulang rusuk ke pusar).',
      'Peras otot perut dengan kuat selama 1 detik di posisi bawah.',
      'Kembalikan tubuh ke posisi awal secara perlahan sambil menarik napas tanpa melepaskan ketegangan otot perut.'
    ],
    tips: [
      'Fokus pada gerakan menggulung tulang belakang (spinal flexion), bukan sekadar melipat badan lurus dari pinggul.',
      'Buang seluruh udara dari paru-paru di puncak kontraksi.'
    ],
    commonMistakes: [
      'Menarik beban menggunakan lengan dan bahu.',
      'Menekuk badan dengan punggung tetap lurus sehingga hanya melatih hip flexor.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=abdominal+crunch+machine+form',
    alternatives: ['Kneeling Cable Crunch', 'Torso Rotation Machine (Obliques)']
  },
  {
    name: 'Kneeling Cable Crunch',
    primaryMuscle: MuscleGroup.ABS,
    secondaryMuscles: [],
    equipment: EquipmentType.CABLE,
    weightIncrement: 2.5,
    steps: [
      'Pasang tali (rope) pada katrol atas dan berlutut di lantai (gunakan matras) menghadap atau membelakangi mesin.',
      'Pegang ujung tali tepat di samping pelipis/telinga dan kunci posisi tangan di sana.',
      'Jaga pinggul tetap diam, lalu gulung punggung atas ke bawah mengarahkan siku ke arah paha/lutut sambil membuang napas.',
      'Tahan kontraksi perut 1 detik, lalu kembali naik perlahan hingga perut terasa memanjang.'
    ],
    tips: [
      'Jangan duduk ke arah tumit saat turun; pinggul harus tetap berada tinggi di atas lutut.',
      'Tangan hanya berfungsi menahan tali di samping kepala, jangan mendorong tali ke bawah.'
    ],
    commonMistakes: [
      'Menggerakkan pinggul maju-mundur seperti gerakan bersujud dengan punggung lurus.',
      'Menggunakan beban terlalu ringan sehingga hanya mengandalkan berat badan.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=kneeling+cable+crunch+form',
    alternatives: ['Abdominal Crunch Machine', 'Torso Rotation Machine (Obliques)']
  },
  {
    name: 'Torso Rotation Machine (Obliques)',
    primaryMuscle: MuscleGroup.ABS,
    secondaryMuscles: [],
    equipment: EquipmentType.MACHINE,
    weightIncrement: 5,
    steps: [
      'Atur posisi awal putaran mesin ke salah satu sisi, lalu duduk atau berlutut di bantalan bawah.',
      'Tempelkan dada/bahu pada bantalan atas untuk mengunci tubuh bagian atas.',
      'Putar tubuh bagian bawah (atau atas, tergantung jenis mesin) ke sisi berlawanan menggunakan otot perut samping (obliques).',
      'Kembalikan secara perlahan ke posisi awal, selesaikan seluruh repetisi di satu sisi, lalu ganti ke sisi sebelahnya.'
    ],
    tips: [
      'Gunakan beban moderat dan hindari gerakan menyentak untuk menjaga keamanan tulang belakang.',
      'Pastikan jumlah repetisi dan beban sama persis antara sisi kiri dan kanan.'
    ],
    commonMistakes: [
      'Memutar dengan sentakan cepat yang memberi tekanan berlebih pada diskus tulang belakang.',
      'Mendorong menggunakan tenaga lengan.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=torso+rotation+machine+form',
    alternatives: ['Kneeling Cable Crunch', 'Abdominal Crunch Machine']
  }
];

async function main() {
  console.log('Memulai proses seeding 40 gerakan mesin...');

  let createdCount = 0;
  let updatedCount = 0;

  for (const ex of machineExercises) {
    const existing = await prisma.exercise.findFirst({
      where: {
        name: ex.name,
        userId: null,
      },
    });

    if (existing) {
      await prisma.exercise.update({
        where: { id: existing.id },
        data: {
          primaryMuscle: ex.primaryMuscle,
          secondaryMuscles: ex.secondaryMuscles,
          equipment: ex.equipment,
          weightIncrement: ex.weightIncrement,
          steps: ex.steps,
          tips: ex.tips,
          commonMistakes: ex.commonMistakes,
          videoUrl: ex.videoUrl,
          alternatives: ex.alternatives,
          isCustom: false,
          isArchived: false,
        },
      });
      updatedCount++;
    } else {
      await prisma.exercise.create({
        data: {
          userId: null,
          name: ex.name,
          primaryMuscle: ex.primaryMuscle,
          secondaryMuscles: ex.secondaryMuscles,
          equipment: ex.equipment,
          weightIncrement: ex.weightIncrement,
          steps: ex.steps,
          tips: ex.tips,
          commonMistakes: ex.commonMistakes,
          videoUrl: ex.videoUrl,
          alternatives: ex.alternatives,
          isCustom: false,
          isArchived: false,
        },
      });
      createdCount++;
    }
  }

  console.log(
    `Seeding selesai! (${createdCount} gerakan baru dibuat, ${updatedCount} gerakan diperbarui). Total: ${machineExercises.length} gerakan.`
  );
}

main()
  .catch((e) => {
    console.error('Gagal melakukan seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
