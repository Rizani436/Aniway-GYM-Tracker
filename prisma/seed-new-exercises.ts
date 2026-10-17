import { MuscleGroup, EquipmentType } from '@prisma/client';
import type { SeedExercise } from './seed';

// DIBANGKITKAN OTOMATIS oleh scripts/build-seed-entries.cjs — jangan edit manual.
//
// 77 gerakan hasil kurasi dari free-exercise-db (Unlicense), dipilih untuk
// menutup celah pustaka: sebelum ini 0 gerakan dumbbell/barbell/berat badan, dan
// otot GLUTES/ABS/CALVES/FOREARMS sangat sedikit. Setiap URL gambar sudah diverifikasi
// membalas HTTP 200 (dua sudut foto: 0.jpg posisi awal, 1.jpg posisi akhir).
export const newExercises: SeedExercise[] = [
  {
    name: 'Chin-Up',
    primaryMuscle: MuscleGroup.BACK,
    secondaryMuscles: [MuscleGroup.BICEPS, MuscleGroup.FOREARMS],
    equipment: EquipmentType.BODYWEIGHT,
    weightIncrement: 5,
    steps: [
      'Genggam pull-up bar dengan telapak tangan menghadap ke arah Anda dan selebar bahu atau lebih sempit.',
      'Gantung lurus dengan lengan terentang penuh, dada dibusungkan, punggung bawah sedikit melengkung, dan perut dikencangkan.',
      'Tarik tubuh ke atas saat membuang napas hingga dagu melewati palang, siku tetap rapat di samping badan.',
      'Tahan 1 detik di posisi puncak sambil mengencangkan otot punggung dan bisep.',
      'Turunkan tubuh perlahan selama 2-3 hitungan sampai lengan benar-benar lurus dan lat terasa tertarik.'
    ],
    tips: [
      'Jaga torso tetap tegak dan minim gerakan agar bisep bekerja maksimal, bukan punggung bagian atas.',
      'Fokus tarik dengan siku menuju tulang rusuk; lengan bawah hanya bertugas memegang palang.',
      'Kencangkan core dan rapatkan kaki agar tubuh tidak berayun saat mengangkat.'
    ],
    commonMistakes: [
      'Mengayunkan badan atau menendang kaki untuk menambah momentum saat menarik.',
      'Tidak menurunkan badan sampai lengan benar-benar lurus sehingga setengah repetisi hilang.',
      'Mendongakkan kepala agar dagu terlihat melewati palang, bukan menarik tubuh lebih tinggi.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=chin+up+form',
    imageUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Chin-Up/0.jpg',
    alternatives: [],
  },
  {
    name: 'Cocoons',
    primaryMuscle: MuscleGroup.ABS,
    secondaryMuscles: [],
    equipment: EquipmentType.BODYWEIGHT,
    weightIncrement: 5,
    steps: [
      'Berbaring telentang di matras, kedua kaki lurus dan kedua tangan terentang di belakang kepala.',
      'Tarik kedua lutut ke arah dada sambil memutar panggul agar bokong terangkat dari lantai.',
      'Pada saat bersamaan tekuk tulang punggung dan bawa kedua tangan ke depan melewati kepala.',
      'Tahan kontraksi 1 detik di titik tertinggi sambil membuang napas.',
      'Kembalikan tubuh perlahan ke posisi awal selama 2 hitungan lalu ulangi.'
    ],
    tips: [
      'Bayangkan melipat tubuh menjadi satu bola kecil; perut yang memulai, bukan leher.',
      'Turunkan kaki hanya sampai sekitar 10 cm di atas lantai agar tegangan perut tidak hilang.',
      'Lakukan dengan tempo lambat supaya perut bagian atas dan bawah sama-sama bekerja.'
    ],
    commonMistakes: [
      'Menarik leher dengan kedua tangan sehingga timbul nyeri, alih-alih menekuk tulang punggung.',
      'Mengayunkan kaki dengan momentum sehingga perut tidak bekerja mengangkat panggul.',
      'Menurunkan kaki terlalu dekat ke lantai sampai punggung bawah melengkung dan terasa sakit.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=cocoons+form',
    imageUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Cocoons/0.jpg',
    alternatives: [],
  },
  {
    name: 'Pullups',
    primaryMuscle: MuscleGroup.BACK,
    secondaryMuscles: [MuscleGroup.BICEPS],
    equipment: EquipmentType.BODYWEIGHT,
    weightIncrement: 5,
    steps: [
      'Genggam palang dengan telapak tangan menghadap menjauh dan selebar bahu atau sedikit lebih lebar.',
      'Gantung penuh dengan lengan lurus, tubuh dimiringkan ke belakang sekitar 30 derajat, dada dibusungkan.',
      'Tarik tubuh saat membuang napas dengan menekan bahu dan lengan atas ke bawah-belakang sampai palang menyentuh dada atas.',
      'Tahan 1 detik di posisi kontraksi penuh sambil mengencangkan otot punggung.',
      'Tarik napas lalu turunkan tubuh perlahan sampai lengan lurus dan lat benar-benar tertarik.'
    ],
    tips: [
      'Tarik dengan siku seperti menekan siku ke arah lantai, jangan menarik memakai tangan.',
      'Kencangkan pangkal belikat sebelum mulai menarik agar dada terangkat dan punggung lebih aktif.',
      'Hindari memikirkan lengan bawah; tugasnya hanya memegang palang dengan kencang.'
    ],
    commonMistakes: [
      'Setengah gerakan: dada atas tidak menyentuh palang atau lengan tidak kembali lurus.',
      'Mengayun badan seperti pendulum untuk menyelesaikan repetisi tambahan.',
      'Membiarkan bahu naik ke arah telinga sehingga beban berpindah ke leher.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=pullups+form',
    imageUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Pullups/0.jpg',
    alternatives: [],
  },
  {
    name: 'Pushups',
    primaryMuscle: MuscleGroup.CHEST,
    secondaryMuscles: [MuscleGroup.SHOULDERS, MuscleGroup.TRICEPS],
    equipment: EquipmentType.BODYWEIGHT,
    weightIncrement: 5,
    steps: [
      'Berbaring telungkup, letakkan tangan selebar bahu atau sedikit lebih lebar, tubuh dijaga lurus satu garis.',
      'Kencangkan perut dan bokong, lalu turunkan dada saat menarik napas hingga hampir menyentuh lantai.',
      'Jaga siku membentuk sudut sekitar 45 derajat terhadap badan, tidak melebar penuh ke samping.',
      'Dorong lantai dan angkat tubuh kembali ke posisi awal saat membuang napas, kencangkan dada di puncak.',
      'Tahan 1 detik di posisi atas lalu turun lagi untuk repetisi berikutnya.'
    ],
    tips: [
      'Jika pinggul melorot atau menonjol, kencangkan core; tubuh harus tetap seperti papan.',
      'Letakkan tangan lebih sempit untuk menekankan trisep, lebih lebar untuk menekankan dada.',
      'Pastikan dada benar-benar turun dekat lantai di setiap repetisi agar rentang gerak penuh.'
    ],
    commonMistakes: [
      'Turun hanya sebagian sehingga dada masih jauh dari lantai dan repetisi jadi setengah.',
      'Membiarkan siku melebar hampir 90 derajat sehingga bahu menerima tekanan berlebih.',
      'Menonjolkan bokong ke atas agar lebih mudah mendorong tubuh naik.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=pushups+form',
    imageUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Pushups/0.jpg',
    alternatives: [],
  },
  {
    name: 'Air Bike',
    primaryMuscle: MuscleGroup.ABS,
    secondaryMuscles: [],
    equipment: EquipmentType.BODYWEIGHT,
    weightIncrement: 5,
    steps: [
      'Berbaring telentang dengan punggung bawah menempel lantai dan tangan di samping kepala tanpa menarik leher.',
      'Angkat bahu ke posisi crunch, lalu angkat lutut sampai tulang kering sejajar lantai.',
      'Luruskan kaki kanan ke depan sementara lutut kiri ditarik masuk, siku kanan mendekati lutut kiri.',
      'Kembali ke posisi awal saat menarik napas, lalu lakukan sisi sebaliknya dengan siku kiri ke lutut kanan.',
      'Gantikan sisi secara terus-menerus hingga jumlah repetisi per sisi terpenuhi.'
    ],
    tips: [
      'Gerakkan kaki dengan lambat seperti mengayuh sepeda berat agar perut tetap tegang.',
      'Putar tubuh dari bahu untuk mendekatkan siku ke lutut, jangan menarik leher dengan tangan.',
      'Semakin lambat ritmenya, semakin besar tantangan untuk stabilitas core Anda.'
    ],
    commonMistakes: [
      'Menarik kepala dengan tangan sehingga leher nyeri, bukan perut yang bekerja.',
      'Melakukan gerakan terlalu cepat dan mengayunkan kaki memakai momentum.',
      'Membiarkan punggung bawah terangkat dari lantai saat kaki mendekat ke lantai.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=air+bike+form',
    imageUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Air_Bike/0.jpg',
    alternatives: [],
  },
  {
    name: 'Butt-Ups',
    primaryMuscle: MuscleGroup.ABS,
    secondaryMuscles: [],
    equipment: EquipmentType.BODYWEIGHT,
    weightIncrement: 5,
    steps: [
      'Ambil posisi push-up tetapi bertumpu pada lengan bawah dengan siku menekuk 90 derajat.',
      'Lengkungkan punggung sedikit ke atas, jangan menahannya benar-benar lurus.',
      'Angkat bokong ke arah langit-langit saat membuang napas sambil mengencangkan perut menutup jarak tulang rusuk dan panggul.',
      'Tahan posisi high bridge 1 detik, lalu turunkan perlahan ke posisi awal saat menarik napas.',
      'Jaga punggung tetap aktif dan ulangi sesuai jumlah repetisi yang dianjurkan.'
    ],
    tips: [
      'Tekan lengan bawah ke lantai dan dorong panggul ke belakang-atas, bukan sekadar mengangkat bokong.',
      'Pertahankan kepala netral menghadap sedikit ke depan agar garis leher tetap aman.',
      'Jalankan setiap repetisi dengan tempo lambat dan terkontrol agar perut terus tegang.'
    ],
    commonMistakes: [
      'Membiarkan punggung bawah melorot ke lantai saat kembali ke posisi awal.',
      'Menaikkan bokong dengan melengkungkan punggung berlebihan tanpa mengaktifkan perut.',
      'Menahan napas saat mengangkat panggul, alih-alih membuang napas di fase naik.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=butt+ups+form',
    imageUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Butt-Ups/0.jpg',
    alternatives: [],
  },
  {
    name: 'Star Jump',
    primaryMuscle: MuscleGroup.QUADS,
    secondaryMuscles: [MuscleGroup.CALVES, MuscleGroup.GLUTES, MuscleGroup.HAMSTRINGS, MuscleGroup.SHOULDERS],
    equipment: EquipmentType.BODYWEIGHT,
    weightIncrement: 5,
    steps: [
      'Berdiri santai dengan kaki selebar bahu dan kedua tangan rapat di samping badan.',
      'Turunkan tubuh setengah squat lalu lompat setinggi mungkin dengan dorongan eksplosif.',
      'Saat di udara, rentangkan kedua kaki dan kedua tangan ke samping membentuk bintang.',
      'Mendarat dengan lutut menekuk untuk menyerap benturan dan tangan kembali rapat ke badan.',
      'Segera lakukan lompatan berikutnya dengan ritme yang teratur dan terkontrol.'
    ],
    tips: [
      'Mendarat pada bagian tengah kaki lalu gulir ke tumit, dan jaga lutut sejajar ujung jari.',
      'Gunakan ayunan tangan untuk menambah tinggi lompatan serta menstabilkan tubuh saat mendarat.',
      'Karena ikut membebani betis, glute, dan bahu, lakukan dalam set pendek berkualitas.'
    ],
    commonMistakes: [
      'Mendarat dengan kaki lurus dan lutut terkunci sehingga benturan langsung ke sendi.',
      'Mendarat dengan lutut jatuh ke dalam sehingga membebani lutut berlebihan.',
      'Melakukan gerakan terlalu cepat tanpa mendarat stabil sehingga teknik memburuk.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=star+jump+form',
    imageUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Star_Jump/0.jpg',
    alternatives: [],
  },
  {
    name: 'Bench Dips',
    primaryMuscle: MuscleGroup.TRICEPS,
    secondaryMuscles: [MuscleGroup.CHEST, MuscleGroup.SHOULDERS],
    equipment: EquipmentType.BODYWEIGHT,
    weightIncrement: 5,
    steps: [
      'Duduk di tepi bangku, letakkan kedua tangan di tepi bangku di samping pinggul, lalu geser bokong ke depan.',
      'Luruskan kaki ke depan dengan tumit sebagai tumpuan dan badan tetap dekat bangku.',
      'Turunkan tubuh saat menarik napas dengan menekuk siku hingga sudut lengan atas dan bawah sedikit di bawah 90 derajat.',
      'Dorong tubuh kembali ke atas dengan trisep saat membuang napas hingga lengan hampir lurus.',
      'Tahan 1 detik di posisi atas lalu ulangi sesuai repetisi yang dianjurkan.'
    ],
    tips: [
      'Jaga siku tetap rapat di samping badan dan lengan bawah selalu mengarah ke bawah.',
      'Semakin jauh posisi kaki dari bangku, semakin besar beban yang diterima trisep Anda.',
      'Untuk pemula, tekuk lutut agar kaki mendekat ke bangku dan beban terasa lebih ringan.'
    ],
    commonMistakes: [
      'Membiarkan siku melebar ke samping sehingga beban berpindah ke sendi bahu.',
      'Menurunkan tubuh terlalu dalam sampai bahu terasa tertekan dan nyeri.',
      'Bertumpu pada ujung jari tangan sehingga telapak dan pergelangan tidak stabil.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=bench+dips+form',
    imageUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Bench_Dips/0.jpg',
    alternatives: [],
  },
  {
    name: 'Split Jump',
    primaryMuscle: MuscleGroup.QUADS,
    secondaryMuscles: [MuscleGroup.CALVES, MuscleGroup.GLUTES, MuscleGroup.HAMSTRINGS],
    equipment: EquipmentType.BODYWEIGHT,
    weightIncrement: 5,
    steps: [
      'Ambil posisi lunge dengan satu kaki di depan menekuk dan lutut belakang hampir menyentuh lantai.',
      'Pastikan lutut kaki depan tetap berada di atas bagian tengah kaki, tidak melewati ujung jari.',
      'Luruskan kedua kaki dan lompat setinggi mungkin sambil mengayunkan lengan ke atas.',
      'Saat mendarat, rapatkan kaki lalu kembalikan ke posisi lunge awal untuk menyerap benturan.',
      'Ulangi dan ganti kaki depan setiap repetisi sesuai jumlah yang dianjurkan.'
    ],
    tips: [
      'Pertahankan dada tegak dan pandangan ke depan agar pendaratan tetap seimbang.',
      'Mendarat dengan lembut pada bagian tengah kaki sebelum tumit menyentuh lantai.',
      'Ayunan lengan yang tegas membantu menghasilkan dorongan lompatan yang lebih tinggi.'
    ],
    commonMistakes: [
      'Membiarkan lutut depan bergerak jauh melewati ujung jari sehingga lutut terbebani berlebihan.',
      'Mendarat dengan kaki lurus dan lutut terkunci sehingga benturan keras ke sendi.',
      'Membungkuk ke depan saat melompat sehingga punggung bawah menahan beban berlebih.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=split+jump+form',
    imageUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Split_Jump/0.jpg',
    alternatives: [],
  },
  {
    name: 'Clean Shrug',
    primaryMuscle: MuscleGroup.BACK,
    secondaryMuscles: [MuscleGroup.FOREARMS, MuscleGroup.SHOULDERS],
    equipment: EquipmentType.BARBELL,
    weightIncrement: 2.5,
    steps: [
      'Genggam barbell selebar bahu dengan cengkeraman double overhand atau hook, palang menggantung di pertengahan paha.',
      'Berdiri dengan punggung lurus, badan dimiringkan sedikit ke depan, dan kedua lengan tetap lurus.',
      'Angkat kedua bahu ke arah telinga saat membuang napas tanpa menekuk siku.',
      'Tahan kontraksi bahu 1 detik di puncak, lalu turunkan palang perlahan ke posisi awal.',
      'Ulangi sesuai repetisi yang dianjurkan dengan tempo yang selalu terkontrol.'
    ],
    tips: [
      'Fokus pada gerakan bahu naik dan turun, bukan pada lengan atau pergelangan tangan.',
      'Beban bisa lebih berat dari clean, tetapi jangan sampai eksekusi melambat dan kontraksi hilang.',
      'Kencangkan core dan lengan bawah agar palang tetap stabil dan dekat paha.'
    ],
    commonMistakes: [
      'Menekuk siku sehingga beban terangkat seperti row, bukan mengangkat bahu.',
      'Memakai beban terlalu berat sampai gerakan melambat dan rentang gerak mengecil.',
      'Membiarkan punggung membungkuk saat memegang palang di posisi awal.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=clean+shrug+form',
    imageUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Clean_Shrug/0.jpg',
    alternatives: [],
  },
  {
    name: 'Shotgun Row',
    primaryMuscle: MuscleGroup.BACK,
    secondaryMuscles: [MuscleGroup.BICEPS],
    equipment: EquipmentType.CABLE,
    weightIncrement: 2.5,
    steps: [
      'Pasang satu handle pada pulley rendah, lalu pilih beban yang sesuai.',
      'Berdiri beberapa langkah di depan mesin dengan kuda-kuda lebar dan satu tangan terentang ke depan.',
      'Tarik handle ke arah pinggul saat membuang napas dengan menarik belikat ke belakang lalu menekuk siku.',
      'Putar pergelangan tangan ke atas selama menarik agar bisep ikut bekerja lebih aktif.',
      'Tahan 1 detik di posisi kontraksi lalu kembali ke posisi awal secara perlahan.'
    ],
    tips: [
      'Tarik siku ke arah belakang dan bawah, bukan mengangkat bahu ke arah telinga.',
      'Pertahankan torso dan panggul tetap diam; hanya lengan dan belikat yang bergerak.',
      'Latih kedua sisi dengan beban yang sama agar kekuatan punggung tetap seimbang.'
    ],
    commonMistakes: [
      'Memakai momentum tubuh dengan memutar torso untuk menarik beban.',
      'Menarik dengan tangan dan bahu tanpa lebih dulu mengencangkan belikat.',
      'Berdiri terlalu dekat mesin sehingga jalur kabel bertabrakan dengan kaki.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=shotgun+row+form',
    imageUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Shotgun_Row/0.jpg',
    alternatives: [],
  },
  {
    name: 'Plyo Push-up',
    primaryMuscle: MuscleGroup.CHEST,
    secondaryMuscles: [MuscleGroup.SHOULDERS, MuscleGroup.TRICEPS],
    equipment: EquipmentType.BODYWEIGHT,
    weightIncrement: 5,
    steps: [
      'Ambil posisi push-up dengan tangan selebar bahu dan seluruh tubuh lurus satu garis.',
      'Turunkan dada ke arah lantai dengan menekuk siku saat menarik napas.',
      'Di posisi bawah, dorong lantai secepat mungkin saat membuang napas hingga kedua tangan lepas dari lantai.',
      'Mendarat kembali dengan siku sedikit menekuk untuk menyerap benturan, lalu ulangi.',
      'Untuk tingkat lanjut, tepukkan kedua tangan di udara sebelum mendarat.'
    ],
    tips: [
      'Tahan tubuh tetap kaku seperti papan selama melayang agar pendaratan tidak membebani punggung.',
      'Kuasai push-up biasa dengan teknik benar sebelum menambahkan lompatan.',
      'Lakukan repetisi dalam jumlah kecil namun berkualitas karena ini latihan ledakan.'
    ],
    commonMistakes: [
      'Mendarat dengan siku terkunci penuh sehingga benturan langsung ke sendi.',
      'Membiarkan pinggul melorot saat mendorong sehingga pinggang terasa nyeri.',
      'Melakukan terlalu banyak repetisi sampai dorongan melemah dan teknik memburuk.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=plyo+push+up+form',
    imageUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Plyo_Push-up/0.jpg',
    alternatives: [],
  },
  {
    name: 'Pull Through',
    primaryMuscle: MuscleGroup.GLUTES,
    secondaryMuscles: [MuscleGroup.HAMSTRINGS, MuscleGroup.BACK],
    equipment: EquipmentType.CABLE,
    weightIncrement: 2.5,
    steps: [
      'Pasang tali atau handle pada pulley rendah, lalu berdiri membelakangi mesin dengan kaki mengangkang lebar.',
      'Bungkukkan badan dari pinggul dan raih tali melewati sela kaki sejauh mungkin, lutut tetap sedikit menekuk.',
      'Kencangkan perut lalu dorong pinggul ke depan saat membuang napas hingga tubuh berdiri tegak.',
      'Remas glute 1 detik di posisi atas dengan lengan tetap lurus sepanjang gerakan.',
      'Kembali menekuk pinggul secara perlahan saat menarik napas untuk repetisi berikutnya.'
    ],
    tips: [
      'Semua tenaga berasal dari dorongan pinggul, bukan dari lengan atau bahu Anda.',
      'Rasakan tarikan di hamstring saat menekuk dan kontraksi glute saat berdiri tegak.',
      'Jaga punggung netral dan dada terbuka agar punggung bawah tidak terbebani berlebih.'
    ],
    commonMistakes: [
      'Menarik tali dengan lengan dan bahu sehingga glute tidak mendapat beban.',
      'Menekuk lutut terlalu banyak sehingga gerakan berubah menjadi squat.',
      'Melengkungkan punggung bawah saat menekuk pinggul di posisi awal.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=pull+through+form',
    imageUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Pull_Through/0.jpg',
    alternatives: [],
  },
  {
    name: 'Barbell Squat',
    primaryMuscle: MuscleGroup.QUADS,
    secondaryMuscles: [MuscleGroup.CALVES, MuscleGroup.GLUTES, MuscleGroup.HAMSTRINGS, MuscleGroup.BACK],
    equipment: EquipmentType.BARBELL,
    weightIncrement: 2.5,
    steps: [
      'Letakkan palang di belakang bahu, dorong dengan kaki dan tegakkan torso untuk mengangkatnya dari rak.',
      'Melangkah mundur, berdiri dengan kaki selebar bahu, ujung kaki sedikit mengarah keluar, kepala tetap terangkat.',
      'Turunkan palang perlahan saat menarik napas dengan menekuk lutut dan pinggul, punggung tetap lurus, sampai sudut paha dan betis sedikit di bawah 90 derajat.',
      'Jika teknik benar, lutut berada pada garis lurus dengan ujung jari dan pinggul turun di antara kedua kaki.',
      'Dorong lantai dengan tumit saat membuang napas untuk berdiri kembali ke posisi awal.'
    ],
    tips: [
      'Jaga kepala tetap terangkat dan pandangan ke depan; menunduk membuat keseimbangan hilang.',
      'Saat turun, rasakan gerakan seperti duduk ke belakang, bukan hanya menekuk lutut.',
      'Tekan lutut sedikit ke luar mengikuti arah ujung kaki agar jalur sendi tetap aman.'
    ],
    commonMistakes: [
      'Membiarkan lutut bergerak melewati ujung jari sehingga muncul tekanan berlebih pada lutut.',
      'Menaikkan tumit dan bertumpu pada ujung kaki saat berdiri sehingga beban bergeser dari kuadrisep.',
      'Membulatkan punggung bawah saat turun sehingga punggung kehilangan posisi netral.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=barbell+squat+form',
    imageUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Barbell_Squat/0.jpg',
    alternatives: [],
  },
  {
    name: 'Clean Deadlift',
    primaryMuscle: MuscleGroup.HAMSTRINGS,
    secondaryMuscles: [MuscleGroup.FOREARMS, MuscleGroup.GLUTES, MuscleGroup.BACK, MuscleGroup.QUADS],
    equipment: EquipmentType.BARBELL,
    weightIncrement: 2.5,
    steps: [
      'Berdiri dengan barbell menempel tulang kering, kaki tepat di bawah pinggul dan ujung kaki sedikit mengarah keluar.',
      'Jongkoklah ke palang dan genggam selebar bahu dengan double overhand atau hook, tulang punggung dalam posisi lurus penuh.',
      'Atur sudut punggung hingga bahu berada di depan palang dan badan setegak mungkin, lalu tarik napas dan kencangkan core.',
      'Dorong lantai melalui bagian depan tumit dan jaga sudut punggung konstan, buka lutut sedikit ke samping agar palang tidak terbentur.',
      'Setelah palang melewati lutut, dorong pinggul ke depan sampai pinggul dan lutut lurus, lalu turunkan palang terkontrol.'
    ],
    tips: [
      'Jaga palang tetap dekat tulang kering sepanjang gerakan agar tuas pada punggung minimal.',
      'Remas palang dengan kuat dan kencangkan lengan bawah agar cengkeraman tidak membuka.',
      'Tekan lantai dengan kaki seperti menjauhkan lantai dari badan, bukan mengangkat dengan punggung.'
    ],
    commonMistakes: [
      'Mengangkat beban dengan punggung membungkuk dan pinggul naik lebih cepat dari bahu.',
      'Membiarkan palang menjauh dari tulang kering sehingga beban berpindah ke punggung bawah.',
      'Meluruskan lutut sebelum pinggul mendorong sehingga tekanan berpindah ke punggung.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=clean+deadlift+form',
    imageUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Clean_Deadlift/0.jpg',
    alternatives: [],
  },
  {
    name: 'Dumbbell Raise',
    primaryMuscle: MuscleGroup.SHOULDERS,
    secondaryMuscles: [MuscleGroup.BICEPS],
    equipment: EquipmentType.DUMBBELL,
    weightIncrement: 2.5,
    steps: [
      'Pegang satu dumbbell di tiap tangan, berdiri tegak dengan lengan di samping badan dan siku sedikit menekuk.',
      'Posisikan dumbbell di samping paha dengan telapak tangan menghadap ke belakang.',
      'Angkat kedua dumbbell ke samping saat membuang napas, siku memimpin gerakan dan selalu lebih tinggi dari lengan bawah.',
      'Lanjutkan hingga dumbbell hampir sejajar dagu, lalu tahan 1 detik di posisi atas.',
      'Turunkan dumbbell perlahan selama 2 hitungan saat menarik napas, lalu ulangi.'
    ],
    tips: [
      'Jaga torso dan pinggul tetap diam agar tidak ada ayunan badan saat mengangkat.',
      'Bayangkan siku sebagai penggerak utama; tangan hanya bertugas memegang beban.',
      'Gunakan beban yang bisa dikontrol karena bahu rentan cedera bila memakai momentum.'
    ],
    commonMistakes: [
      'Mengayunkan badan atau menendang pinggul untuk mengangkat dumbbell ke atas.',
      'Mengangkat dumbbell melewati dagu sehingga gerakan berubah menjadi upright row.',
      'Memakai beban terlalu berat sampai pergelangan tangan dan leher ikut tegang.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=dumbbell+raise+form',
    imageUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Dumbbell_Raise/0.jpg',
    alternatives: [],
  },
  {
    name: 'Dumbbell Squat',
    primaryMuscle: MuscleGroup.QUADS,
    secondaryMuscles: [MuscleGroup.CALVES, MuscleGroup.GLUTES, MuscleGroup.HAMSTRINGS, MuscleGroup.BACK],
    equipment: EquipmentType.DUMBBELL,
    weightIncrement: 2.5,
    steps: [
      'Berdiri tegak memegang dumbbell di masing-masing tangan dengan telapak menghadap sisi paha.',
      'Buka kaki selebar bahu dengan ujung kaki sedikit mengarah keluar, pandangan dan kepala tetap terangkat.',
      'Turunkan torso perlahan saat menarik napas dengan menekuk lutut dan pinggul, punggung tetap lurus.',
      'Turun sampai paha sejajar lantai dan lutut berada pada garis lurus dengan ujung jari kaki.',
      'Dorong lantai dengan tumit saat membuang napas untuk berdiri kembali ke posisi awal.'
    ],
    tips: [
      'Buang napas di fase naik dan tarik napas saat turun untuk menjaga stabilitas core.',
      'Busungkan dada dan jaga punggung netral agar dumbbell tidak menarik bahu ke depan.',
      'Gunakan stance selebar bahu untuk pembentukan menyeluruh otot paha Anda.'
    ],
    commonMistakes: [
      'Menunduk ke lantai sehingga keseimbangan hilang dan punggung membulat.',
      'Menaikkan tumit saat turun sehingga lutut menerima beban berlebih.',
      'Hanya turun sebagian dan tidak mencapai posisi paha sejajar lantai.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=dumbbell+squat+form',
    imageUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Dumbbell_Squat/0.jpg',
    alternatives: [],
  },
  {
    name: 'Glute Kickback',
    primaryMuscle: MuscleGroup.GLUTES,
    secondaryMuscles: [MuscleGroup.HAMSTRINGS],
    equipment: EquipmentType.BODYWEIGHT,
    weightIncrement: 5,
    steps: [
      'Berlutut di matras, tekuk pinggul dengan kedua tangan lurus di depan selebar bahu seperti posisi push-up.',
      'Pandangan ke depan dan pastikan lutut menekuk 90 derajat antara hamstring dan betis.',
      'Angkat kaki kanan saat membuang napas sampai hamstring sejajar punggung, sudut lutut tetap 90 derajat.',
      'Tahan kontraksi glute 1 detik di posisi atas dengan paha sejajar lantai dan betis tegak lurus.',
      'Turunkan kaki perlahan saat menarik napas, lalu gantikan ke kaki kiri hingga set selesai.'
    ],
    tips: [
      'Kencangkan glute sepanjang gerakan, terutama di titik tertinggi, bukan hanya mengayun kaki.',
      'Rasakan kontraksi di bokong, bukan di punggung bawah; jika pinggang tegang, kurangi tinggi angkatan.',
      'Jaga punggung netral dan panggul tetap sejajar saat mengangkat satu kaki.'
    ],
    commonMistakes: [
      'Mengayunkan kaki dengan cepat memakai momentum sehingga glute tidak berkontraksi.',
      'Melengkungkan punggung bawah saat mengangkat kaki sehingga timbul nyeri.',
      'Membiarkan panggul miring atau terbuka saat mengangkat satu kaki.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=glute+kickback+form',
    imageUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Glute_Kickback/0.jpg',
    alternatives: [],
  },
  {
    name: 'Landmine 180\'s',
    primaryMuscle: MuscleGroup.ABS,
    secondaryMuscles: [MuscleGroup.GLUTES, MuscleGroup.BACK, MuscleGroup.SHOULDERS],
    equipment: EquipmentType.BARBELL,
    weightIncrement: 2.5,
    steps: [
      'Pasang satu ujung barbell ke landmine atau kunci kuat di sudut ruangan, lalu bebani sesuai kebutuhan.',
      'Angkat palang dari lantai ke ketinggian bahu dengan kedua tangan lurus di depan dan kuda-kuda lebar.',
      'Putar batang tubuh dan pinggul saat membuang napas, ayunkan beban turun sepenuhnya ke satu sisi.',
      'Pertahankan kedua lengan tetap terentang lurus selama gerakan, jangan menekuknya saat memutar.',
      'Balik arah gerakan untuk mengayunkan beban ke sisi berlawanan dan bergantian hingga set selesai.'
    ],
    tips: [
      'Jaga core kencang dan biarkan pinggul serta kaki ikut berputar, bukan hanya lengan Anda.',
      'Ikuti arah ujung palang dengan pandangan, tetapi kepala tetap netral terhadap tulang punggung.',
      'Latihan ini sekaligus melatih glute, punggung, dan bahu karena tubuh menahan rotasi.'
    ],
    commonMistakes: [
      'Memutar hanya dengan lengan dan memaksa bahu sementara pinggul tetap kaku.',
      'Menekuk siku saat mengayun sehingga jalur gerakan tidak lagi membentuk setengah lingkaran.',
      'Berdiri kaku dengan kaki rapat sehingga keseimbangan hilang saat beban bergerak ke samping.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=landmine+180+s+form',
    imageUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Landmine_180s/0.jpg',
    alternatives: [],
  },
  {
    name: 'Vertical Swing',
    primaryMuscle: MuscleGroup.HAMSTRINGS,
    secondaryMuscles: [MuscleGroup.GLUTES, MuscleGroup.QUADS, MuscleGroup.SHOULDERS],
    equipment: EquipmentType.DUMBBELL,
    weightIncrement: 2.5,
    steps: [
      'Pegang satu dumbbell dengan kedua tangan dan biarkan menggantung lurus di antara kaki, punggung lurus, kepala terangkat.',
      'Ayunkan dumbbell ke belakang di antara kaki dengan menekuk pinggul dan sedikit menekuk lutut.',
      'Balikkan gerakan dengan kuat saat membuang napas, luruskan pinggul, lutut, dan pergelangan untuk mendorong tubuh naik.',
      'Ayunkan dumbbell melewati kepala sampai lengan terentang di atas, lalu mendarat dengan menyerap benturan lewat kaki.',
      'Tarik dumbbell kembali ke arah torso sebelum repetisi berikutnya untuk mengatur ritme gerakan.'
    ],
    tips: [
      'Tenaga berasal dari hentakan pinggul, bukan dari bahu yang mengangkat beban.',
      'Jaga lengan tetap lurus dan rileks seperti tali, dumbbell mengikuti jalur gerakan pinggul.',
      'Pertahankan punggung netral dan core kencang karena ini juga melatih glute, kuadrisep, dan bahu.'
    ],
    commonMistakes: [
      'Mengangkat dumbbell dengan lengan dan bahu sehingga pinggul tidak melakukan hentakan.',
      'Membulatkan punggung saat menekuk pinggul untuk mengayun beban ke belakang.',
      'Melompat terlalu tinggi tanpa mengontrol pendaratan sehingga lutut menerima benturan keras.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=vertical+swing+form',
    imageUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Vertical_Swing/0.jpg',
    alternatives: [],
  },
  {
    name: 'Cable Judo Flip',
    primaryMuscle: MuscleGroup.ABS,
    secondaryMuscles: [],
    equipment: EquipmentType.CABLE,
    weightIncrement: 2.5,
    steps: [
      'Pasang tali (rope) pada pulley paling bawah, lalu berdiri menyamping menghadap tiang dengan kaki terbuka lebar.',
      'Tekuk lutut sedikit dan genggam kedua ujung tali dengan kedua tangan pada posisi rendah.',
      'Putar badan menjauh dari pulley sambil menarik tali melewati bahu, seperti gerakan bantingan judo.',
      'Pindahkan berat badan antar kaki sambil memutar dan membungkukkan badan ke depan, tarik kabel ke bawah.',
      'Kembali ke posisi awal dengan kontrol, ulangi sesuai repetisi, lalu ganti sisi tubuh Anda.'
    ],
    tips: [
      'Putaran harus berasal dari otot perut samping, bukan dari tarikan lengan dan bahu.',
      'Tahan 1 detik saat kabel sudah berada di bawah untuk merasakan kontraksi perut menyamping.',
      'Gunakan beban ringan sampai ritme putar terasa halus sebelum menambah beban.'
    ],
    commonMistakes: [
      'Menarik kabel hanya dengan lengan dan bahu sehingga otot perut tidak bekerja.',
      'Memutar pinggul terlalu jauh sampai tubuh kehilangan keseimbangan.',
      'Memakai beban terlalu berat sehingga gerakan menjadi mengandalkan momentum.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=cable+judo+flip+form',
    imageUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Cable_Judo_Flip/0.jpg',
    alternatives: [],
  },
  {
    name: 'Dumbbell Lunges',
    primaryMuscle: MuscleGroup.QUADS,
    secondaryMuscles: [MuscleGroup.CALVES, MuscleGroup.GLUTES, MuscleGroup.HAMSTRINGS],
    equipment: EquipmentType.DUMBBELL,
    weightIncrement: 2.5,
    steps: [
      'Berdiri tegak dengan satu dumbbell di masing-masing tangan, lengan lurus di samping badan.',
      'Langkahkan kaki kanan ke depan sekitar satu langkah panjang sambil badan tetap tegak.',
      'Turunkan tubuh dengan menekuk kedua lutut sampai lutut belakang hampir menyentuh lantai, tarik napas.',
      'Dorong dengan tumit kaki depan untuk kembali berdiri tegak sambil menghembuskan napas.',
      'Ulangi sesuai repetisi, lalu lakukan gerakan yang sama dengan kaki kiri di depan.'
    ],
    tips: [
      'Tekan tumit untuk mengaktifkan glutes dan hamstring, bukan hanya otot quadriceps.',
      'Jaga tulang kering kaki depan tetap vertikal agar lutut tidak maju melewati ujung kaki.',
      'Pandangan lurus ke depan dan otot perut dikencangkan untuk menjaga keseimbangan.'
    ],
    commonMistakes: [
      'Melangkah terlalu pendek sehingga lutut depan maju jauh melewati ujung kaki dan membebani sendi.',
      'Membungkuk ke depan atau mencondongkan badan sehingga punggung bawah menyerap beban.',
      'Menjatuhkan lutut belakang ke lantai tanpa kontrol karena kehilangan keseimbangan.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=dumbbell+lunges+form',
    imageUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Dumbbell_Lunges/0.jpg',
    alternatives: [],
  },
  {
    name: 'Cable Chest Press',
    primaryMuscle: MuscleGroup.CHEST,
    secondaryMuscles: [MuscleGroup.SHOULDERS, MuscleGroup.TRICEPS],
    equipment: EquipmentType.CABLE,
    weightIncrement: 2.5,
    steps: [
      'Atur beban pada mesin kabel, lalu duduk dan genggam kedua handle dengan siku menekuk sekitar 90 derajat.',
      'Posisikan lengan atas sekitar 45 derajat dari badan, dada dan kepala tetap tegak.',
      'Tekan kedua handle lurus ke depan sampai lengan hampir lurus sambil menarik tulang belikat ke belakang.',
      'Tahan 1 detik di titik ekstensi penuh tanpa mengunci sendi siku.',
      'Kembalikan handle perlahan ke posisi awal dan jaga kabel tetap tegang sepanjang gerakan.'
    ],
    tips: [
      'Rapatkan kedua handle hampir bersentuhan di depan untuk mendapat kontraksi otot dada lebih kuat.',
      'Bahu depan dan triceps ikut bekerja, jadi turunkan beban dalam 2 hitungan untuk kontrol.',
      'Jangan biarkan kabel menegang penuh di titik awal, sisakan sedikit tegangan sebelum repetisi berikutnya.'
    ],
    commonMistakes: [
      'Mengunci siku dengan hentakan di ujung dorongan sehingga beban pindah ke sendi.',
      'Membuka siku terlalu lebar ke samping hingga bahu depan terasa nyeri.',
      'Melepas tegangan kabel di akhir repetisi sehingga otot dada kehilangan rangsangan.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=cable+chest+press+form',
    imageUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Cable_Chest_Press/0.jpg',
    alternatives: [],
  },
  {
    name: 'Anti-Gravity Press',
    primaryMuscle: MuscleGroup.SHOULDERS,
    secondaryMuscles: [MuscleGroup.BACK, MuscleGroup.TRICEPS],
    equipment: EquipmentType.BARBELL,
    weightIncrement: 2.5,
    steps: [
      'Letakkan barbell di lantai tepat di belakang kepala bangku incline.',
      'Tengkurap di bangku, lalu ambil barbell dari lantai dengan pegangan pronasi (telapak menghadap bawah).',
      'Tekuk siku dan lakukan reverse curl untuk membawa palang mendekat ke dada; ini posisi awal.',
      'Luruskan siku untuk mendorong palang ke depan melewati kepala Anda dengan lengan sejajar lantai.',
      'Tahan sebentar, lalu kembalikan beban ke posisi awal dengan kontrol dan ulangi set.'
    ],
    tips: [
      'Jaga kedua lengan tetap sejajar lantai sepanjang gerakan agar beban tetap bekerja pada bahu.',
      'Gerakkan beban lambat karena posisi ini mudah membuat bahu tertarik ke depan.',
      'Triceps dan punggung atas ikut menstabilkan, jadi hindari mengangkat beban dengan hentakan.'
    ],
    commonMistakes: [
      'Memakai beban terlalu berat sehingga punggung melengkung menekan bangku.',
      'Membiarkan siku turun di bawah ketinggian lantai sehingga bahu tertekan berlebihan.',
      'Mengayun palang dengan bantuan pinggul dan badan, bukan dengan otot bahu.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=anti+gravity+press+form',
    imageUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Anti-Gravity_Press/0.jpg',
    alternatives: [],
  },
  {
    name: 'Plie Dumbbell Squat',
    primaryMuscle: MuscleGroup.QUADS,
    secondaryMuscles: [MuscleGroup.ABS, MuscleGroup.CALVES, MuscleGroup.GLUTES, MuscleGroup.HAMSTRINGS],
    equipment: EquipmentType.DUMBBELL,
    weightIncrement: 2.5,
    steps: [
      'Pegang dumbbell dengan kedua tangan pada bagian ujungnya, lalu berdiri tegak.',
      'Buka kaki lebih lebar dari bahu dan arahkan ujung kaki keluar sekitar 45 derajat dengan lutut sedikit ditekuk.',
      'Turunkan tubuh perlahan dengan menekuk lutut sampai paha sejajar lantai, tarik napas saat turun.',
      'Tekan terutama dengan tumit untuk kembali ke posisi berdiri sambil menghembuskan napas.',
      'Ulangi sesuai repetisi dengan lengan tetap diam di antara kedua kaki.'
    ],
    tips: [
      'Turunkan beban dalam 2 hitungan, tahan 1 detik di bawah, lalu naik dalam 1 hitungan untuk kontrol.',
      'Kencangkan otot perut dan glutes selama gerakan agar tubuh tetap stabil dan punggung aman.',
      'Jaga dada tetap terbuka dan tumit menempel lantai sepanjang gerakan.'
    ],
    commonMistakes: [
      'Menekuk lutut ke arah dalam saat berdiri sehingga sendi lutut menanggung tekanan berlebih.',
      'Mengangkat tumit sampai berat badan berpindah ke ujung kaki.',
      'Membuka kaki terlalu sempit sehingga gerakan jadi menyerupai squat biasa.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=plie+dumbbell+squat+form',
    imageUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Plie_Dumbbell_Squat/0.jpg',
    alternatives: [],
  },
  {
    name: 'Standing Cable Lift',
    primaryMuscle: MuscleGroup.ABS,
    secondaryMuscles: [MuscleGroup.SHOULDERS],
    equipment: EquipmentType.CABLE,
    weightIncrement: 2.5,
    steps: [
      'Pasang handle tunggal pada pulley paling bawah, lalu berdiri menyamping sekitar sepanjang lengan dari tiang.',
      'Buka kaki selebar bahu, tekuk sedikit lutut, dan genggam handle dengan kedua tangan tetap lurus.',
      'Dalam satu gerakan, tarik handle melintang naik melewati badan sampai kedua lengan lurus di atas kepala.',
      'Putar kaki belakang dan luruskan lutut untuk mencapai rentang gerak penuh, punggung tetap lurus.',
      'Turunkan kembali beban secara perlahan dan terkendali ke posisi netral.'
    ],
    tips: [
      'Bayangkan menarik beban diagonal dari pinggul ke seberang atas; putar dari perut dan pinggul.',
      'Jaga lengan tetap dekat badan dan lurus, jangan mengangkat beban dengan otot bahu saja.',
      'Bahu ikut bekerja di akhir gerakan, jadi kencangkan perut agar pinggul tidak membuka lebih dulu.'
    ],
    commonMistakes: [
      'Menarik beban hanya dengan lengan dan bahu tanpa memutar tubuh menyilang.',
      'Membiarkan lengan menekuk sehingga beban tidak pernah mencapai posisi di atas kepala.',
      'Menurunkan beban terlalu cepat sampai tubuh kehilangan kendali dan keseimbangan.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=standing+cable+lift+form',
    imageUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Standing_Cable_Lift/0.jpg',
    alternatives: [],
  },
  {
    name: 'Upright Barbell Row',
    primaryMuscle: MuscleGroup.SHOULDERS,
    secondaryMuscles: [MuscleGroup.BACK],
    equipment: EquipmentType.BARBELL,
    weightIncrement: 2.5,
    steps: [
      'Genggam barbell dengan pegangan pronasi sedikit lebih sempit dari bahu, palang bersandar di paha atas.',
      'Berdiri tegak dengan punggung lurus dan siku sedikit ditekuk; ini posisi awal.',
      'Angkat palang dengan mengangkat siku tinggi ke samping dan buang napas saat naik.',
      'Terus angkat sampai palang hampir menyentuh dagu, tahan 1 detik di puncak gerakan.',
      'Turunkan palang perlahan kembali ke posisi awal sambil menarik napas.'
    ],
    tips: [
      'Siku harus memimpin gerakan dan selalu berada lebih tinggi dari lengan bawah.',
      'Jaga palang tetap dekat dengan badan; menjauhkannya membuat sendi bahu tidak stabil.',
      'Otot punggung ikut menstabilkan, jadi jaga badan tetap diam sepanjang gerakan.'
    ],
    commonMistakes: [
      'Menarik palang jauh dari badan sehingga tekanan pada sendi bahu bertambah.',
      'Mengangkat palang terlalu tinggi melewati dagu yang bisa mencubit jaringan bahu.',
      'Mengayun badan atau pinggul untuk membantu mengangkat beban.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=upright+barbell+row+form',
    imageUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Upright_Barbell_Row/0.jpg',
    alternatives: [],
  },
  {
    name: 'Cable Shoulder Press',
    primaryMuscle: MuscleGroup.SHOULDERS,
    secondaryMuscles: [MuscleGroup.TRICEPS],
    equipment: EquipmentType.CABLE,
    weightIncrement: 2.5,
    steps: [
      'Turunkan kedua pulley ke posisi paling bawah dan pilih beban yang sesuai.',
      'Berdiri tepat di antara kedua tiang, genggam handle di ketinggian bahu dengan telapak menghadap ke depan.',
      'Jaga kepala dan dada tetap tegak, luruskan siku untuk mendorong handle tepat di atas kepala.',
      'Tahan 1 detik di posisi atas, lalu kembalikan handle perlahan ke ketinggian bahu.',
      'Ulangi gerakan dengan ritme naik 1 hitungan dan turun 2 hitungan.'
    ],
    tips: [
      'Dorong handle ke atas dan sedikit ke depan agar beban tetap bekerja pada bahu depan.',
      'Kencangkan otot perut supaya pinggul tidak terdorong ke depan saat mendorong beban.',
      'Triceps ikut mengunci dorongan, jadi jaga siku tetap tepat di bawah pergelangan tangan.'
    ],
    commonMistakes: [
      'Membungkukkan badan ke belakang untuk mendorong beban sehingga punggung bawah tertekan.',
      'Membiarkan siku melebar jauh ke samping sehingga beban berpindah ke bahu belakang.',
      'Mendorong handle terlalu jauh ke depan sampai berubah menjadi gerakan press dada.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=cable+shoulder+press+form',
    imageUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Cable_Shoulder_Press/0.jpg',
    alternatives: [],
  },
  {
    name: 'Dumbbell Bench Press',
    primaryMuscle: MuscleGroup.CHEST,
    secondaryMuscles: [MuscleGroup.SHOULDERS, MuscleGroup.TRICEPS],
    equipment: EquipmentType.DUMBBELL,
    weightIncrement: 2.5,
    steps: [
      'Berbaring di bangku datar dengan satu dumbbell di setiap tangan bertumpu di atas paha, telapak saling menghadap.',
      'Gunakan paha untuk membantu mengangkat dumbbell satu per satu ke depan setinggi bahu.',
      'Putar pergelangan tangan ke depan sehingga telapak menghadap menjauh, lengan atas dan bawah membentuk 90 derajat.',
      'Buang napas dan dorong dumbbell ke atas dengan otot dada sampai lengan lurus di puncak.',
      'Kencangkan dada, tahan 1 detik, lalu turunkan beban perlahan dua kali lebih lambat dari saat naik.'
    ],
    tips: [
      'Tarik tulang belikat ke belakang dan rapatkan agar dada lebih aktif dan bahu stabil.',
      'Turunkan beban sekitar 2 hitungan dan angkat 1 hitungan untuk kontrol dan rangsangan maksimal.',
      'Triceps dan bahu depan ikut bekerja, jadi jaga siku sekitar 45 derajat dari badan.'
    ],
    commonMistakes: [
      'Membiarkan siku melebar 90 derajat ke samping sehingga bahu terbebani dan kerja dada berkurang.',
      'Memantulkan dumbbell di dada alih-alih mengendalikan turunnya beban.',
      'Mengunci siku dengan hentakan di puncak sehingga beban berpindah ke sendi.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=dumbbell+bench+press+form',
    imageUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Dumbbell_Bench_Press/0.jpg',
    alternatives: [],
  },
  {
    name: 'Dumbbell Incline Row',
    primaryMuscle: MuscleGroup.BACK,
    secondaryMuscles: [MuscleGroup.BICEPS, MuscleGroup.FOREARMS, MuscleGroup.SHOULDERS],
    equipment: EquipmentType.DUMBBELL,
    weightIncrement: 2.5,
    steps: [
      'Atur bangku incline pada sudut rendah, lalu tengkurap di atasnya dengan punggung netral.',
      'Pegang satu dumbbell di masing-masing tangan dengan pegangan netral dan lengan lurus ke bawah.',
      'Tarik tulang belikat ke belakang lalu tekuk siku untuk menarik dumbbell ke sisi badan.',
      'Tahan 1 detik di puncak tarikan dengan siku merapat ke arah tulang rusuk.',
      'Turunkan dumbbell perlahan kembali ke posisi awal dan ulangi sesuai repetisi.'
    ],
    tips: [
      'Pusatkan tenaga pada otot punggung tengah dan rapatkan tulang belikat di setiap tarikan.',
      'Forearm dan biceps ikut menahan beban, tapi jangan jadikan keduanya penggerak utama.',
      'Jaga dada tetap menempel bangku agar punggung bekerja tanpa bantuan ayunan badan.'
    ],
    commonMistakes: [
      'Mengangkat lengan terlalu tinggi sampai bahu yang mengangkat beban.',
      'Mengangkat dada dari bangku atau mengayun badan saat menarik dumbbell.',
      'Menarik siku terlalu cepat ke belakang dengan momentum sehingga kontraksi punggung hilang.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=dumbbell+incline+row+form',
    imageUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Dumbbell_Incline_Row/0.jpg',
    alternatives: [],
  },
  {
    name: 'One-Arm Dumbbell Row',
    primaryMuscle: MuscleGroup.BACK,
    secondaryMuscles: [MuscleGroup.BICEPS, MuscleGroup.SHOULDERS],
    equipment: EquipmentType.DUMBBELL,
    weightIncrement: 2.5,
    steps: [
      'Letakkan kaki kanan di ujung bangku dan tangan kanan di ujung lainnya untuk menopang badan.',
      'Bungkukkan badan dari pinggang sampai punggung sejajar lantai dengan punggung bawah tetap lurus.',
      'Ambil dumbbell di lantai dengan tangan kiri, telapak menghadap badan; ini posisi awal.',
      'Tarik dumbbell lurus naik ke sisi dada dengan siku rapat ke badan sambil menghembuskan napas.',
      'Tahan kontraksi 1 detik, lalu turunkan beban lurus ke bawah sambil menarik napas.'
    ],
    tips: [
      'Bayangkan siku Anda ditarik ke arah pinggul dan biarkan otot punggung yang mengangkat beban.',
      'Kencangkan otot punggung saat dumbbell berada di posisi teratas untuk kontraksi maksimal.',
      'Forearm hanya bertugas memegang dumbbell, jadi jangan menarik beban dengan pergelangan tangan.'
    ],
    commonMistakes: [
      'Mengangkat badan atau memutar bahu setiap kali menarik dumbbell.',
      'Menarik dumbbell ke arah bahu dengan siku melebar sehingga biceps yang bekerja.',
      'Membulatkan punggung bawah karena beban terlalu berat untuk ukuran Anda.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=one+arm+dumbbell+row+form',
    imageUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/One-Arm_Dumbbell_Row/0.jpg',
    alternatives: [],
  },
  {
    name: 'One-Arm Long Bar Row',
    primaryMuscle: MuscleGroup.BACK,
    secondaryMuscles: [MuscleGroup.BICEPS],
    equipment: EquipmentType.BARBELL,
    weightIncrement: 2.5,
    steps: [
      'Pasang salah satu ujung barbell pada landmine atau sudut ruangan agar tidak bergeser, lalu pasang beban.',
      'Berdiri menyamping palang dan genggam dengan satu tangan dekat collar palang.',
      'Gunakan pinggul dan kaki untuk berdiri tegak sambil membawa barbell ke posisi siap.',
      'Ambil posisi lutut sedikit ditekuk dengan pinggul ke belakang dan dada tegak, lengan terentang.',
      'Tarik beban ke sisi badan dengan menarik tulang belikat dan menekuk siku tanpa hentakan.',
      'Jeda sebentar di puncak tarikan, lalu kembalikan beban ke posisi awal dengan kontrol.'
    ],
    tips: [
      'Jaga punggung netral dan dada tetap tegak sepanjang tarikan, biarkan otot punggung bekerja.',
      'Biceps ikut membantu, tapi jangan memulai tarikan dengan mendorong bahu ke depan.',
      'Kencangkan otot perut dan glutes untuk menstabilkan pinggul saat beban ditarik.'
    ],
    commonMistakes: [
      'Menghentak atau mencurangi gerakan saat beban terasa berat.',
      'Memutar badan berlebihan sehingga beban lebih banyak diangkat oleh pinggul.',
      'Berdiri terlalu jauh dari landmine sehingga palang menekan badan dan jalur gerak kacau.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=one+arm+long+bar+row+form',
    imageUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/One-Arm_Long_Bar_Row/0.jpg',
    alternatives: [],
  },
  {
    name: 'One Arm Lat Pulldown',
    primaryMuscle: MuscleGroup.BACK,
    secondaryMuscles: [MuscleGroup.BICEPS],
    equipment: EquipmentType.CABLE,
    weightIncrement: 2.5,
    steps: [
      'Pasang beban yang sesuai dan atur bantalan lutut agar tubuh tidak terangkat saat menarik.',
      'Genggam handle dengan pegangan pronasi (telapak menghadap bawah) dan duduk tegak; ini posisi awal.',
      'Tarik handle ke bawah dengan menekuk siku dan merapatkannya ke sisi badan.',
      'Tahan 1 detik di posisi bawah saat siku sudah merapat ke badan.',
      'Kembalikan handle perlahan ke atas tanpa membiarkan beban kembali penuh agar otot tetap tegang.'
    ],
    tips: [
      'Bayangkan siku Anda ditarik ke bawah ke arah kantong celana, bukan tangan yang menarik.',
      'Biceps ikut membantu, tetapi fokuskan tarikan pada otot lat dengan siku tetap rapat badan.',
      'Jaga dada terangkat dan badan diam agar tarikan tidak berubah menjadi row.'
    ],
    commonMistakes: [
      'Menarik handle dengan biceps sehingga siku menjauh dari sisi badan.',
      'Membiarkan badan terdorong ke belakang atau bahu terangkat saat menarik.',
      'Melepas tegangan sepenuhnya di antara repetisi sehingga otot kehilangan rangsangan.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=one+arm+lat+pulldown+form',
    imageUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/One_Arm_Lat_Pulldown/0.jpg',
    alternatives: [],
  },
  {
    name: 'Bent Over Barbell Row',
    primaryMuscle: MuscleGroup.BACK,
    secondaryMuscles: [MuscleGroup.BICEPS, MuscleGroup.SHOULDERS],
    equipment: EquipmentType.BARBELL,
    weightIncrement: 2.5,
    steps: [
      'Genggam barbell dengan pegangan pronasi, lalu tekuk lutut sedikit dan bungkukkan badan dari pinggang.',
      'Bungkuk sampai punggung hampir sejajar lantai dengan punggung lurus dan kepala menatap ke depan.',
      'Biarkan barbell menggantung lurus di depan Anda dengan lengan tegak; ini posisi awal.',
      'Buang napas dan tarik barbell ke arah perut dengan siku rapat ke badan.',
      'Kencangkan otot punggung di posisi teratas, tahan sebentar, lalu turunkan perlahan sambil menarik napas.'
    ],
    tips: [
      'Jaga punggung lurus dan kepala tetap terangkat sepanjang gerakan untuk melindungi tulang belakang.',
      'Hanya lengan bawah yang memegang beban; siku dekat badan yang memimpin tarikan.',
      'Biceps dan bahu belakang ikut menstabilkan, tapi jangan mengayun untuk membantu mengangkat.'
    ],
    commonMistakes: [
      'Membulatkan punggung saat membungkuk sehingga punggung bawah berisiko cedera.',
      'Mengayun badan ke atas dan ke bawah untuk mengangkat beban dengan momentum.',
      'Menarik barbell terlalu tinggi ke arah dada sehingga bahu ikut terangkat.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=bent+over+barbell+row+form',
    imageUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Bent_Over_Barbell_Row/0.jpg',
    alternatives: [],
  },
  {
    name: 'Seated Dumbbell Press',
    primaryMuscle: MuscleGroup.SHOULDERS,
    secondaryMuscles: [MuscleGroup.TRICEPS],
    equipment: EquipmentType.DUMBBELL,
    weightIncrement: 2.5,
    steps: [
      'Duduk di bangku dengan penopang punggung dan letakkan dumbbell tegak di atas paha.',
      'Gunakan paha untuk mendorong dumbbell satu per satu ke ketinggian bahu di setiap sisi.',
      'Putar pergelangan tangan sehingga telapak menghadap ke depan; ini posisi awal.',
      'Buang napas dan dorong dumbbell ke atas sampai keduanya hampir bersentuhan di atas kepala.',
      'Tahan 1 detik, lalu turunkan beban perlahan ke posisi awal sambil menarik napas.'
    ],
    tips: [
      'Kencangkan otot perut dan jaga punggung tetap menempel sandaran agar punggung bawah stabil.',
      'Turunkan beban dalam 2 hitungan dan hindari mengunci siku dengan hentakan di posisi atas.',
      'Triceps ikut mengunci dorongan, jadi jaga siku tetap di bawah pergelangan tangan.'
    ],
    commonMistakes: [
      'Melengkungkan punggung dari sandaran sehingga gerakan berubah menjadi incline press.',
      'Mendorong dumbbell ke depan bukan lurus ke atas sehingga jalur beban tidak efisien.',
      'Menurunkan beban terlalu cepat sehingga bahu menyerap beban berlebih.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=seated+dumbbell+press+form',
    imageUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Seated_Dumbbell_Press/0.jpg',
    alternatives: [],
  },
  {
    name: 'Decline Dumbbell Flyes',
    primaryMuscle: MuscleGroup.CHEST,
    secondaryMuscles: [],
    equipment: EquipmentType.DUMBBELL,
    weightIncrement: 2.5,
    steps: [
      'Kunci kaki di ujung bangku decline, lalu berbaring dengan satu dumbbell di masing-masing tangan di atas paha.',
      'Angkat dumbbell ke depan dengan lengan tegak lurus lantai dan telapak saling menghadap; ini posisi awal.',
      'Tekuk siku sedikit dan tetap konstan, lalu buka kedua lengan ke samping dengan busur lebar sampai dada teregang, tarik napas.',
      'Buang napas dan rapatkan kembali kedua lengan ke posisi awal sambil mengencangkan otot dada.',
      'Tahan 1 detik di posisi terkontraksi, lalu ulangi sesuai repetisi.'
    ],
    tips: [
      'Gerakan hanya terjadi di sendi bahu; jaga siku pada tekukan konstan agar biceps tendon aman.',
      'Gunakan busur gerakan yang sama saat naik dan turun untuk kontrol dan hasil maksimal.',
      'Bahu depan ikut bekerja, jadi jangan mengangkat dumbbell melewati ketinggian dada.'
    ],
    commonMistakes: [
      'Menekuk siku berubah-ubah seperti gerakan press sehingga beban pindah ke triceps.',
      'Membuka lengan terlalu jauh ke belakang sampai bahu terasa nyeri.',
      'Membiarkan kedua dumbbell bertabrakan di atas tanpa kendali.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=decline+dumbbell+flyes+form',
    imageUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Decline_Dumbbell_Flyes/0.jpg',
    alternatives: [],
  },
  {
    name: 'Dips - Triceps Version',
    primaryMuscle: MuscleGroup.TRICEPS,
    secondaryMuscles: [MuscleGroup.CHEST, MuscleGroup.SHOULDERS],
    equipment: EquipmentType.BODYWEIGHT,
    weightIncrement: 5,
    steps: [
      'Genggam kedua palang dan angkat tubuh dengan lengan hampir lurus terkunci di atas palang.',
      'Tarik napas dan turunkan tubuh perlahan dengan badan tetap tegak dan siku rapat ke badan.',
      'Turun sampai lengan atas dan lengan bawah membentuk sudut 90 derajat.',
      'Hembuskan napas dan dorong tubuh kembali ke atas dengan otot triceps sampai lengan lurus.',
      'Ulangi sesuai repetisi dengan ritme turun 2 hitungan dan naik 1 hitungan.'
    ],
    tips: [
      'Jaga badan tetap tegak agar beban lebih fokus pada triceps ketimbang dada.',
      'Jika terasa terlalu berat, gunakan mesin assisted dip atau minta bantuan menopang kaki.',
      'Otot dada dan bahu depan ikut bekerja, jadi jaga siku jangan melebar ke samping.'
    ],
    commonMistakes: [
      'Membiarkan siku melebar ke samping sehingga bahu menyerap beban dan berisiko cedera.',
      'Turun terlalu dalam sampai bahu tertekan berlebihan di posisi bawah.',
      'Mengayun badan atau menggunakan momentum untuk mendorong tubuh ke atas.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=dips+triceps+version+form',
    imageUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Dips_-_Triceps_Version/0.jpg',
    alternatives: [],
  },
  {
    name: 'Incline Dumbbell Flyes',
    primaryMuscle: MuscleGroup.CHEST,
    secondaryMuscles: [MuscleGroup.SHOULDERS],
    equipment: EquipmentType.DUMBBELL,
    weightIncrement: 2.5,
    steps: [
      'Atur bangku incline maksimal 30 derajat, lalu berbaring dengan satu dumbbell di setiap tangan.',
      'Luruskan lengan di atas dada dengan sedikit tekukan tetap di siku.',
      'Putar pergelangan tangan sehingga telapak menghadap Anda dan jari kelingking hampir bersentuhan; ini posisi awal.',
      'Tarik napas dan turunkan lengan ke samping dengan busur lebar sambil memutar telapak menghadap lantai.',
      'Hembuskan napas dan rapatkan kembali kedua dumbbell ke posisi awal dengan kelingking bersentuhan lagi.'
    ],
    tips: [
      'Gerakan hanya terjadi di sendi bahu dan pergelangan; jaga siku pada tekukan yang sama sepanjang set.',
      'Bayangkan Anda sedang memeluk batang pohon besar agar busur gerakan tetap lebar dan dada teregang.',
      'Bahu depan ikut bekerja, jadi jangan menurunkan beban terlalu rendah ke belakang dada.'
    ],
    commonMistakes: [
      'Mengatur bangku terlalu tegak sehingga gerakan berubah menjadi press bahu.',
      'Menekuk siku berubah-ubah sehingga gerakan jadi setengah press, bukan flyes.',
      'Menurunkan lengan terlalu jauh melewati garis badan sehingga bahu tertekan.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=incline+dumbbell+flyes+form',
    imageUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Incline_Dumbbell_Flyes/0.jpg',
    alternatives: [],
  },
  {
    name: 'Cable Internal Rotation',
    primaryMuscle: MuscleGroup.SHOULDERS,
    secondaryMuscles: [],
    equipment: EquipmentType.CABLE,
    weightIncrement: 2.5,
    steps: [
      'Duduk menyamping di samping pulley bawah dengan kaki lurus atau menyilang, lalu genggam handle dengan tangan terdekat kabel.',
      'Letakkan siku menempel di sisi tubuh dengan tekukan 90 derajat dan lengan bawah mengarah ke pulley; ini posisi awal.',
      'Tarik handle ke arah perut dengan memutar bahu ke dalam sampai lengan bawah melintang di depan perut.',
      'Tahan 1 detik di posisi tersebut, lalu kembalikan lengan bawah perlahan ke posisi awal.',
      'Ulangi sesuai repetisi, lalu gantian dengan lengan yang lain.'
    ],
    tips: [
      'Jaga lengan bawah selalu tegak lurus terhadap badan sepanjang gerakan.',
      'Gunakan beban ringan karena otot rotator cuff cepat lelah dan lebih mengutamakan kontrol.',
      'Siku tetap menempel di sisi tubuh; jangan biarkan siku ikut bergerak atau terangkat.'
    ],
    commonMistakes: [
      'Mengangkat siku dari sisi tubuh sehingga gerakan berubah menjadi tarikan lengan.',
      'Memakai beban terlalu berat sampai badan ikut berputar mengejar beban.',
      'Membiarkan pergelangan tangan menekuk sehingga arah tarikan berubah.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=cable+internal+rotation+form',
    imageUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Cable_Internal_Rotation/0.jpg',
    alternatives: [],
  },
  {
    name: 'Standing Dumbbell Press',
    primaryMuscle: MuscleGroup.SHOULDERS,
    secondaryMuscles: [MuscleGroup.TRICEPS],
    equipment: EquipmentType.DUMBBELL,
    weightIncrement: 2.5,
    steps: [
      'Berdiri tegak dengan kaki selebar pinggul dan pegang satu dumbbell di masing-masing tangan secara netral.',
      'Angkat kedua dumbbell ke setinggi telinga dengan siku membuka keluar hingga membentuk sudut sekitar 90 derajat.',
      'Dorong dumbbell lurus ke atas kepala dengan meluruskan siku, tanpa hentakan kaki atau membusungkan punggung ke belakang.',
      'Tahan 1 detik di puncak saat kedua dumbbell hampir bertemu, lalu turunkan kembali perlahan selama 2 hitungan.'
    ],
    tips: [
      'Kencangkan otot perut dan bokong agar tubuh tidak bergoyang saat menyeimbangkan beban di atas kepala.',
      'Jaga pergelangan tangan tetap netral dan jangan biarkan dumbbell menekuk ke belakang berlebihan.',
      'Untuk melatih stabilitas bahu, turunkan dumbbell hanya sampai setinggi dagu, bukan sampai bahu.'
    ],
    commonMistakes: [
      'Membusungkan punggung ke belakang dan mendorong beban dengan kaki sehingga gerakan berubah menjadi push press.',
      'Membiarkan siku tertinggal di belakang garis dumbbell sehingga sendi bahu terasa terkilir.',
      'Menurunkan dumbbell terlalu cepat tanpa menahan beban sehingga momentum mengambil alih kerja otot.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=standing+dumbbell+press+form',
    imageUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Standing_Dumbbell_Press/0.jpg',
    alternatives: [],
  },
  {
    name: 'Step-up with Knee Raise',
    primaryMuscle: MuscleGroup.GLUTES,
    secondaryMuscles: [MuscleGroup.HAMSTRINGS, MuscleGroup.QUADS],
    equipment: EquipmentType.BODYWEIGHT,
    weightIncrement: 5,
    steps: [
      'Berdiri menghadap box atau bangku setinggi lutut dengan kaki rapat dan tangan rileks di samping badan.',
      'Letakkan satu kaki penuh di atas box, lalu dorong melalui tumit dan lutut kaki depan untuk mengangkat badan.',
      'Saat sudah berdiri tegak di atas box, tekuk pinggul dan lutut kaki belakang, angkat lutut setinggi yang Anda bisa.',
      'Tahan posisi lutut terangkat 1 detik, lalu turunkan kaki kembali ke lantai dengan kontrol.',
      'Ulangi urutan yang sama dengan kaki sebaliknya untuk jumlah repetisi yang sama.'
    ],
    tips: [
      'Tempatkan seluruh telapak kaki di atas box, bukan hanya ujung jari, agar bokong bekerja maksimal.',
      'Pilih tinggi box yang membuat lutut kaki depan membentuk sudut sekitar 90 derajat saat berdiri di atasnya.',
      'Pegang dumbbell di samping badan untuk menambah beban setelah versi berat badan terasa mudah.'
    ],
    commonMistakes: [
      'Berjinjit dengan kaki belakang untuk membantu naik, bukan mengangkat badan dengan kaki yang ada di box.',
      'Melompat atau menjatuhkan badan saat turun sehingga kerja otot bokong dan hamstring hilang.',
      'Memakai box terlalu tinggi sehingga pinggul ikut berputar dan punggung membulat.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=step+up+with+knee+raise+form',
    imageUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Step-up_with_Knee_Raise/0.jpg',
    alternatives: [],
  },
  {
    name: 'Front Raise And Pullover',
    primaryMuscle: MuscleGroup.CHEST,
    secondaryMuscles: [MuscleGroup.BACK, MuscleGroup.SHOULDERS, MuscleGroup.TRICEPS],
    equipment: EquipmentType.BARBELL,
    weightIncrement: 2.5,
    steps: [
      'Berbaring di bangku datar dan pegang palang dengan genggaman telapak menghadap ke bawah, jarak sekitar selebar bahu.',
      'Luruskan lengan dengan siku sedikit ditekuk, letakkan palang di pangkal paha, dan kunci bahu ke bawah sebagai posisi awal.',
      'Angkat palang ke atas kepala dalam busur setengah lingkaran dengan sudut siku tidak berubah, sambil menarik napas.',
      'Teruskan sampai lengan sejajar lantai di atas kepala dengan telapak menghadap langit-langit, lalu kembalikan palang ke pangkal paha sambil membuang napas.'
    ],
    tips: [
      'Kunci sudut siku yang sedikit menekuk dan jangan mengubahnya sepanjang busur 180 derajat demi keamanan bahu.',
      'Mulai dari beban ringan karena lengan lurus menciptakan tuas sangat panjang dan mudah menarik sendi bahu.',
      'Tekan tulang belikat ke bangku sepanjang set agar punggung atas membantu menstabilkan lengan.'
    ],
    commonMistakes: [
      'Menekuk lalu meluruskan siku saat mengangkat sehingga gerakan berubah menjadi pullover penuh.',
      'Menggerakkan palang terlalu cepat hingga melintas dekat wajah tanpa kendali.',
      'Mengangkat pinggul dari bangku untuk mencari tenaga tambahan saat lengan terasa berat.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=front+raise+and+pullover+form',
    imageUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Front_Raise_And_Pullover/0.jpg',
    alternatives: [],
  },
  {
    name: 'Close-Grip Dumbbell Press',
    primaryMuscle: MuscleGroup.TRICEPS,
    secondaryMuscles: [MuscleGroup.CHEST, MuscleGroup.SHOULDERS],
    equipment: EquipmentType.DUMBBELL,
    weightIncrement: 2.5,
    steps: [
      'Berdirikan sebuah dumbbell secara vertikal di ujung bangku datar dan pastikan posisinya kokoh tidak bergeser.',
      'Berbaring tegak lurus pada bangku dengan hanya bagian bahu menempel di permukaan, pinggul di bawah bangku, dan kaki menapak lantai.',
      'Genggam dumbbell dengan kedua tangan dan tahan lurus di atas dada, kedua telapak menekan sisi bawah pelat dumbbell.',
      'Turunkan dumbbell secara terkendali ke arah dada dengan siku tetap rapat di dekat tubuh.',
      'Dorong kembali ke atas dengan meluruskan siku hingga lengan lurus penuh, lalu ulangi sesuai repetisi.'
    ],
    tips: [
      'Rapatkan siku di samping tubuh agar beban fokus ke triceps, bukan melebar ke dada dan bahu.',
      'Tahan 1 detik di posisi puncak dengan siku lurus penuh untuk kontraksi triceps yang lebih kuat.',
      'Jaga pinggul tetap di bawah bangku sehingga punggung tidak melengkung dan sendi bahu tidak tertekan.'
    ],
    commonMistakes: [
      'Membiarkan dumbbell miring atau bergeser karena kedua telapak tidak menahan pelat secara bersamaan.',
      'Membuka siku lebar ke samping sehingga gerakan berubah menjadi chest press.',
      'Mengangkat pinggul dari posisi rendah supaya bisa mendorong beban yang terlalu berat.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=close+grip+dumbbell+press+form',
    imageUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Close-Grip_Dumbbell_Press/0.jpg',
    alternatives: [],
  },
  {
    name: 'Bent Over Two-Dumbbell Row',
    primaryMuscle: MuscleGroup.BACK,
    secondaryMuscles: [MuscleGroup.BICEPS, MuscleGroup.SHOULDERS],
    equipment: EquipmentType.DUMBBELL,
    weightIncrement: 2.5,
    steps: [
      'Berdiri dengan satu dumbbell di masing-masing tangan, telapak menghadap tubuh, dan lutut sedikit ditekuk.',
      'Bungkukkan badan dari pinggul dengan punggung lurus dan kepala terangkat hingga torso hampir sejajar lantai, dumbbell menggantung lurus di depan Anda.',
      'Tarik kedua dumbbell ke sisi tubuh sambil membuang napas, siku tetap rapat di dekat badan tanpa menarik dengan lengan bawah.',
      'Peras otot punggung di posisi kontraksi puncak dan tahan 1 detik.',
      'Turunkan dumbbell kembali perlahan ke posisi awal sambil menarik napas, lalu ulangi.'
    ],
    tips: [
      'Bayangkan siku Anda ditarik ke arah kantong belakang celana, bukan tangan yang mengangkat beban.',
      'Jaga leher netral sejajar tulang belakang dan lutut tertekuk sekitar 15-20 derajat untuk melindungi punggung bawah.',
      'Kencangkan otot perut dan bokong untuk mengunci torso agar tidak berputar atau terayun.'
    ],
    commonMistakes: [
      'Menegakkan torso setiap repetisi sehingga gerakan berubah menjadi upright row setengah jalan.',
      'Membulatkan punggung saat membungkuk sehingga tekanan berpindah ke diskus tulang belakang.',
      'Mengayunkan beban dengan momentum alih-alih menariknya dengan otot punggung.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=bent+over+two+dumbbell+row+form',
    imageUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Bent_Over_Two-Dumbbell_Row/0.jpg',
    alternatives: [],
  },
  {
    name: 'Decline Barbell Bench Press',
    primaryMuscle: MuscleGroup.CHEST,
    secondaryMuscles: [MuscleGroup.SHOULDERS, MuscleGroup.TRICEPS],
    equipment: EquipmentType.BARBELL,
    weightIncrement: 2.5,
    steps: [
      'Kunci kaki di ujung bangku decline, lalu berbaring perlahan dengan punggung menempel penuh pada bangku.',
      'Genggam palang dengan jarak sedang sehingga lengan bawah dan lengan atas membentuk sudut 90 derajat di tengah gerakan.',
      'Minta bantuan spotter melepas palang dari rack, lalu tahan palang lurus di atas dada dengan siku tegak lurus lantai.',
      'Turunkan palang perlahan sambil menarik napas hingga menyentuh dada bagian bawah, lalu tahan 1 detik.',
      'Dorong kembali ke atas dengan otot dada sambil membuang napas, kunci lengan dan peras dada 1 detik.',
      'Ulangi untuk jumlah repetisi yang ditargetkan, lalu kembalikan palang ke rack bersama spotter.'
    ],
    tips: [
      'Perlambat fase turun minimal dua kali lebih lama daripada fase dorong, misalnya 3 hitungan turun dan 1 hitungan naik.',
      'Selalu gunakan spotter saat melepas dan mengembalikan palang agar rotator cuff bahu tetap aman.',
      'Tekan tulang belikat ke bangku dan jaga bokong tetap menempel supaya siku stabil sepanjang gerakan.'
    ],
    commonMistakes: [
      'Memantulkan palang di dada bagian bawah untuk mempermudah dorongan ke atas.',
      'Menggenggam terlalu sempit hingga lengan bawah tidak vertikal dan pergelangan tertekuk.',
      'Mengangkat bokong dari bangku saat beban berat sehingga jalur palang berpindah ke perut bagian atas.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=decline+barbell+bench+press+form',
    imageUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Decline_Barbell_Bench_Press/0.jpg',
    alternatives: [],
  },
  {
    name: 'Stiff-Legged Dumbbell Deadlift',
    primaryMuscle: MuscleGroup.HAMSTRINGS,
    secondaryMuscles: [MuscleGroup.GLUTES, MuscleGroup.BACK],
    equipment: EquipmentType.DUMBBELL,
    weightIncrement: 2.5,
    steps: [
      'Pegang satu dumbbell di masing-masing tangan dengan lengan lurus, lalu berdiri dengan kaki selebar bahu atau lebih sempit.',
      'Tekuk lutut sedikit dan pertahankan sudut itu, lalu dorong bokong jauh ke belakang sambil menurunkan dumbbell menyusuri depan kaki.',
      'Bungkuk dari pinggul dengan punggung lurus dan kepala terangkat hingga terasa regangan kuat di hamstring, lalu buang napas.',
      'Angkat torso kembali tegak dengan mendorong pinggul ke depan sambil menarik napas hingga kembali ke posisi awal.',
      'Ulangi gerakan untuk jumlah repetisi yang ditargetkan tanpa mengubah sudut lutut.'
    ],
    tips: [
      'Bayangkan Anda sedang mendorong pintu di belakang Anda dengan bokong, bukan berjongkok ke bawah.',
      'Berhenti menurunkan beban begitu punggung mulai membulat, karena di situlah batas rentang gerak Anda.',
      'Kencangkan perut dan punggung atas agar tulang belakang tetap netral meski beban bergantung di depan paha.'
    ],
    commonMistakes: [
      'Menekuk lutut terlalu banyak sehingga gerakan berubah menjadi squat.',
      'Membulatkan punggung bawah saat menurunkan beban karena mengejar rentang gerak berlebih.',
      'Menarik beban dengan lengan atau bahu, padahal lengan hanya bertugas menggantung lurus.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=stiff+legged+dumbbell+deadlift+form',
    imageUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Stiff-Legged_Dumbbell_Deadlift/0.jpg',
    alternatives: [],
  },
  {
    name: 'Smith Machine Stiff-Legged Deadlift',
    primaryMuscle: MuscleGroup.HAMSTRINGS,
    secondaryMuscles: [MuscleGroup.GLUTES, MuscleGroup.BACK],
    equipment: EquipmentType.MACHINE,
    weightIncrement: 5,
    steps: [
      'Setel palang Smith Machine setinggi pertengahan paha, pasang beban, lalu genggam palang secara pronasi selebar bahu.',
      'Angkat palang dengan meluruskan lengan sepenuhnya, buka pengait, lalu berdiri tegak dengan kaki selebar bahu atau lebih sempit dan lutut sedikit ditekuk.',
      'Jaga lutut pada sudut tersebut, dorong bokong ke belakang sambil menurunkan palang menyusuri depan kaki hingga hamstring terasa teregang, lalu buang napas.',
      'Dorong pinggul ke depan untuk menegakkan torso kembali sambil menarik napas hingga kembali ke posisi awal.',
      'Ulangi sesuai repetisi, lalu kaitkan kembali palang ke pengait setelah set selesai.'
    ],
    tips: [
      'Gunakan wrist wrap bila beban sudah berat agar genggaman tidak lepas dan pergelangan tetap netral.',
      'Jalur palang sudah terpandu mesin, jadi pusatkan perhatian pada dorongan pinggul, bukan keseimbangan.',
      'Bayangkan bokong Anda sedang menutup pintu mobil di belakang setiap kali menurunkan palang.'
    ],
    commonMistakes: [
      'Menekuk lutut berlebihan sehingga berubah menjadi deadlift biasa dan regangan hamstring hilang.',
      'Menurunkan palang terlalu dalam sampai punggung bawah membulat.',
      'Mengunci sendi lutut sepenuhnya sehingga terasa tertekan saat beban berat.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=smith+machine+stiff+legged+deadlift+form',
    imageUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Smith_Machine_Stiff-Legged_Deadlift/0.jpg',
    alternatives: [],
  },
  {
    name: 'Clean',
    primaryMuscle: MuscleGroup.HAMSTRINGS,
    secondaryMuscles: [MuscleGroup.CALVES, MuscleGroup.FOREARMS, MuscleGroup.GLUTES, MuscleGroup.BACK, MuscleGroup.QUADS, MuscleGroup.SHOULDERS],
    equipment: EquipmentType.BARBELL,
    weightIncrement: 2.5,
    steps: [
      'Berdiri dengan palang di lantai dekat tulang kering dan genggam overhand atau hook grip tepat di luar kaki.',
      'Turunkan pinggul dengan beban bertumpu pada tumit, punggung lurus, dada terangkat, dan bahu sedikit di depan palang.',
      'Tarik pertama: dorong melalui tumit dan luruskan lutut dengan sudut punggung tetap serta lengan lurus hingga palang melewati lutut.',
      'Tarik kedua: saat palang di pertengahan paha, luruskan pinggul, lutut, dan pergelangan kaki dalam gerakan seperti melompat untuk mempercepat palang ke atas.',
      'Tarik ketiga: angkat bahu agresif, tekuk lengan dengan siku ke atas dan keluar, lalu tarik tubuh ke bawah sambil memutar siku di bawah palang.',
      'Terima palang di depan bahu dalam posisi front squat, turun ke posisi squat bawah, lalu segera berdiri dengan mendorong tumit dan siku tetap tinggi.'
    ],
    tips: [
      'Kecepatan adalah kunci: ledakkan tarikan kedua dan jangan memperpanjang fase ekstensi badan.',
      'Jaga palang sedekat mungkin dengan tubuh sepanjang tarikan agar tenaga tidak terbuang ke depan.',
      'Kuasai teknik dengan beban ringan atau dari posisi hang sebelum menambah berat.'
    ],
    commonMistakes: [
      'Menarik palang dengan lengan lebih dulu sehingga siku menekuk sebelum pinggul meledak.',
      'Membiarkan palang menjauh dari tubuh hingga punggung bawah yang harus menahannya.',
      'Menangkap palang dengan siku menghadap ke bawah sehingga beban tidak stabil di bahu.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=clean+form',
    imageUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Clean/0.jpg',
    alternatives: [],
  },
  {
    name: 'Box Squat',
    primaryMuscle: MuscleGroup.QUADS,
    secondaryMuscles: [MuscleGroup.CALVES, MuscleGroup.GLUTES, MuscleGroup.HAMSTRINGS, MuscleGroup.BACK],
    equipment: EquipmentType.BARBELL,
    weightIncrement: 2.5,
    steps: [
      'Siapkan box setinggi yang membuat Anda berjongkok hingga paha sejajar lantai di dalam power rack, lalu posisikan palang di belakang bahu.',
      'Rapatkan tulang belikat dan putar siku ke depan seolah hendak membengkokkan palang di punggung Anda.',
      'Lepas palang dari rack dengan punggung bawah melengkung kuat, lalu melangkah mundur ke posisi berdiri yang mantap.',
      'Atur kaki lebih lebar untuk menekankan bokong dan hamstring, atau lebih rapat untuk quadriceps, dengan kepala menghadap lurus ke depan.',
      'Dengan punggung, bahu, dan otot inti terkunci, dorong lutut dan bokong keluar sambil duduk ke belakang sampai bokong menyentuh box.',
      'Berhenti sejenak di box tanpa memantul, lalu dorong ke atas melalui tumit dan kaki sambil memimpin gerakan dengan kepala.'
    ],
    tips: [
      'Tahan penuh 1-2 detik di box sebelum meledak ke atas untuk melatih kekuatan eksplosif dari posisi statis.',
      'Pertahankan ketegangan dari kepala sampai kaki sepanjang repetisi, termasuk saat duduk di box.',
      'Pastikan tulang kering hampir tegak lurus lantai saat duduk, tanda beban bekerja di bokong bukan di lutut.'
    ],
    commonMistakes: [
      'Memantulkan bokong di box untuk membantu bangkit, kebiasaan yang membahayakan punggung.',
      'Memakai box terlalu rendah tanpa mobilitas pinggul memadai hingga punggung membulat.',
      'Melepas ketegangan pinggul saat menyentuh box sehingga dorongan ke atas dimulai dari posisi lemas.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=box+squat+form',
    imageUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Box_Squat/0.jpg',
    alternatives: [],
  },
  {
    name: 'Clean Pull',
    primaryMuscle: MuscleGroup.QUADS,
    secondaryMuscles: [MuscleGroup.FOREARMS, MuscleGroup.GLUTES, MuscleGroup.HAMSTRINGS, MuscleGroup.BACK],
    equipment: EquipmentType.BARBELL,
    weightIncrement: 2.5,
    steps: [
      'Berdiri dengan palang di lantai dekat tulang kering dan genggam overhand atau hook grip tepat di luar kaki.',
      'Turunkan pinggul dengan beban bertumpu pada tumit, punggung lurus, dada terangkat, dan bahu sedikit di depan palang.',
      'Tarik pertama: dorong melalui tumit dan luruskan lutut dengan sudut punggung tetap dan siku mengarah keluar, hingga palang melewati lutut.',
      'Tarik kedua: saat palang mendekati pertengahan paha, luruskan pinggul dalam gerakan seperti melompat dan percepat palang dengan meluruskan lutut serta pergelangan kaki.',
      'Akhiri dengan ekstensi penuh yang eksplosif, badan lurus sedikit condong ke belakang dan lengan tetap lurus tanpa menarik dengan lengan.'
    ],
    tips: [
      'Gerakan ini melatih fase tarik tanpa harus menangkap palang, jadi fokuskan pada kecepatan ekstensi pinggul.',
      'Berhenti tepat di puncak ekstensi dan jangan memperpanjang gerakan melampaui lurus penuh karena tenaga justru hilang.',
      'Gunakan sabuk atau wrist wrap hanya saat beban sudah berat, bukan sebagai pengganti teknik.'
    ],
    commonMistakes: [
      'Menekuk lengan untuk mengangkat palang sehingga kekuatan pinggul tidak terpakai maksimal.',
      'Memulai tarikan kedua terlalu awal, sebelum palang melewati lutut.',
      'Membiarkan punggung membulat saat menarik beban dari lantai.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=clean+pull+form',
    imageUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Clean_Pull/0.jpg',
    alternatives: [],
  },
  {
    name: 'Good Morning',
    primaryMuscle: MuscleGroup.HAMSTRINGS,
    secondaryMuscles: [MuscleGroup.ABS, MuscleGroup.GLUTES, MuscleGroup.BACK],
    equipment: EquipmentType.BARBELL,
    weightIncrement: 2.5,
    steps: [
      'Letakkan palang di rack setinggi bahu dan posisikan palang di belakang bahu seperti saat power squat, bukan di atas bahu.',
      'Kencangkan punggung, rapatkan tulang belikat, tekuk lutut sedikit, lalu melangkah mundur dari rack.',
      'Bungkukkan badan dari sendi pinggul dengan mendorong bokong ke belakang hingga punggung hampir sejajar lantai, sambil menjaga lekuk alami punggung bawah.',
      'Balikkan gerakan dengan mendorong pinggul ke depan menggunakan bokong dan hamstring hingga kembali berdiri tegak.'
    ],
    tips: [
      'Mulai dari palang kosong atau beban sangat ringan karena tuas gerakan ini panjang dan menekan punggung bawah.',
      'Bayangkan punggung Anda seperti papan kaku, gerakan hanya boleh terjadi di sendi pinggul.',
      'Rilekskan lengan yang memegang palang dan biarkan palang bertumpu mantap di belakang bahu.'
    ],
    commonMistakes: [
      'Menekuk lutut lebih dalam sehingga gerakan berubah menjadi squat dengan beban di punggung.',
      'Membulatkan punggung saat membungkuk karena pinggul tidak didorong ke belakang.',
      'Mendongakkan kepala dan leher berlebihan hingga posisi tulang belakang leher terganggu.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=good+morning+form',
    imageUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Good_Morning/0.jpg',
    alternatives: [],
  },
  {
    name: 'Dumbbell Clean',
    primaryMuscle: MuscleGroup.HAMSTRINGS,
    secondaryMuscles: [MuscleGroup.CALVES, MuscleGroup.FOREARMS, MuscleGroup.GLUTES, MuscleGroup.BACK, MuscleGroup.QUADS, MuscleGroup.SHOULDERS],
    equipment: EquipmentType.DUMBBELL,
    weightIncrement: 2.5,
    steps: [
      'Berdiri dengan satu dumbbell di masing-masing tangan, kaki selebar bahu, dan genggaman netral dengan telapak saling berhadapan.',
      'Turunkan dumbbell ke lantai dengan menekuk pinggul dan lutut serta mendorong pinggul ke belakang hingga dumbbell menyentuh lantai.',
      'Ledakkan gerakan dengan melompat ke atas melalui ekstensi pinggul, lutut, dan pergelangan kaki, sementara lengan tetap lurus.',
      'Setelah ekstensi penuh, tekuk kembali pinggul dan lutut untuk menangkap beban dalam posisi squat sambil membiarkan lengan mengarahkan dumbbell ke bahu.',
      'Dari posisi tangkapan, luruskan pinggul dan lutut untuk berdiri tegak dengan dumbbell bertumpu di bahu.'
    ],
    tips: [
      'Jaga dumbbell tetap dekat dengan tubuh sepanjang tarikan agar tenaga dari pinggul tersalur penuh.',
      'Berdiri dari posisi menangkap dengan tumit menapak kuat, bukan dengan badan membungkuk ke depan.',
      'Tambahkan dorongan ke atas kepala setelah beban mendarat di bahu bila ingin melatih seluruh rangkaian.'
    ],
    commonMistakes: [
      'Mengangkat dumbbell dengan lengan lebih dulu alih-alih meledakkan pinggul.',
      'Menangkap beban dengan punggung membulat dan badan membungkuk ke depan.',
      'Melompat hanya dengan ujung kaki sehingga keseimbangan hilang dan dumbbell menjauh dari tubuh.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=dumbbell+clean+form',
    imageUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Dumbbell_Clean/0.jpg',
    alternatives: [],
  },
  {
    name: 'Kneeling Squat',
    primaryMuscle: MuscleGroup.GLUTES,
    secondaryMuscles: [MuscleGroup.ABS, MuscleGroup.HAMSTRINGS, MuscleGroup.BACK],
    equipment: EquipmentType.BARBELL,
    weightIncrement: 2.5,
    steps: [
      'Setel palang di power rack pada ketinggian yang tepat, lalu berlutut di belakangnya dengan matras sebagai alas lutut.',
      'Selipkan badan ke bawah palang dan posisikan palang melintang di belakang bahu dengan tulang belikat ditarik rapat.',
      'Lepas palang dari rack dengan kepala menghadap lurus ke depan, lalu dudukkan bokong ke belakang sampai menyentuh betis.',
      'Balikkan gerakan dengan mendorong pinggul ke depan untuk mengembalikan torso ke posisi tegak.'
    ],
    tips: [
      'Ini gerakan dominan bokong, jadi pusatkan dorongan pada gluteus dan bukan pada otot paha depan.',
      'Gunakan matras tebal agar lutut nyaman menumpu beban sepanjang gerakan.',
      'Jaga dada terangkat dan punggung netral dari posisi berdiri hingga bokong menyentuh betis.'
    ],
    commonMistakes: [
      'Membiarkan pinggul mengendor di posisi bawah sehingga bokong tidak berlatih memulai dorongan.',
      'Melengkungkan punggung bawah berlebihan saat menahan beban di belakang bahu.',
      'Menjatuhkan bokong ke belakang terlalu cepat hingga keseimbangan tubuh hilang.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=kneeling+squat+form',
    imageUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Kneeling_Squat/0.jpg',
    alternatives: [],
  },
  {
    name: 'High Cable Curls',
    primaryMuscle: MuscleGroup.BICEPS,
    secondaryMuscles: [],
    equipment: EquipmentType.CABLE,
    weightIncrement: 2.5,
    steps: [
      'Berdiri di antara dua katrol tinggi dan ambil satu pegangan di masing-masing tangan dengan lengan atas sejajar lantai dan telapak menghadap Anda.',
      'Kunci lengan atas tetap sejajar lantai dan gerakkan hanya lengan bawah untuk menarik pegangan ke arah telinga.',
      'Keraskan otot biceps saat menarik sambil membuang napas, lalu tahan 1 detik di kontraksi paling penuh.',
      'Kembalikan lengan ke posisi awal secara perlahan sambil menarik napas, lalu ulangi sesuai repetisi.'
    ],
    tips: [
      'Bayangkan Anda sedang melakukan double biceps pose dan tarik siku sedikit ke belakang agar kontraksi lebih terasa.',
      'Atur jarak berdiri cukup dari mesin agar kabel tetap tegang sejak posisi awal.',
      'Putar sedikit pergelangan tangan ke atas di akhir gerakan untuk memeras biceps lebih kuat.'
    ],
    commonMistakes: [
      'Menurunkan lengan atas sehingga gerakan berubah menjadi curl standar.',
      'Membantu tarikan dengan mengayunkan badan atau mendorong siku ke depan.',
      'Membiarkan beban terhempas di akhir fase turun sehingga ketegangan otot hilang.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=high+cable+curls+form',
    imageUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/High_Cable_Curls/0.jpg',
    alternatives: [],
  },
  {
    name: 'Barbell Hip Thrust',
    primaryMuscle: MuscleGroup.GLUTES,
    secondaryMuscles: [MuscleGroup.CALVES, MuscleGroup.HAMSTRINGS],
    equipment: EquipmentType.BARBELL,
    weightIncrement: 2.5,
    steps: [
      'Duduk di lantai dengan bangku tepat di belakang punggung dan palang berbeban berada di atas kaki Anda.',
      'Gulingkan palang hingga tepat di atas pinggul, lalu bersandar ke bangku sehingga tulang belikat menyentuh tepi atas bangku.',
      'Dorong melalui telapak kaki dan angkat pinggul secara vertikal melalui palang dengan tumpuan pada tulang belikat dan kaki.',
      'Ekstensi pinggul sejauh mungkin sambil memeras bokong, tahan 1 detik di puncak, lalu turunkan kembali secara terkendali.'
    ],
    tips: [
      'Gunakan bantalan tebal atau fat bar agar palang tidak menekan tulang pinggul.',
      'Tarik dagu sedikit ke dada dan jangan mendongak di puncak gerakan.',
      'Posisikan tulang kering tegak lurus lantai di puncak agar bokong dan hamstring bekerja maksimal.'
    ],
    commonMistakes: [
      'Melengkungkan punggung bawah untuk mengangkat pinggul lebih tinggi alih-alih memeras bokong.',
      'Menempatkan bangku terlalu tinggi sehingga tulang belikat tidak menumpu dan leher tertekan.',
      'Mendorong dengan ujung kaki sehingga betis dan lutut yang bekerja, bukan bokong.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=barbell+hip+thrust+form',
    imageUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Barbell_Hip_Thrust/0.jpg',
    alternatives: [],
  },
  {
    name: 'Barbell Glute Bridge',
    primaryMuscle: MuscleGroup.GLUTES,
    secondaryMuscles: [MuscleGroup.CALVES, MuscleGroup.HAMSTRINGS],
    equipment: EquipmentType.BARBELL,
    weightIncrement: 2.5,
    steps: [
      'Duduk di lantai dengan palang berbeban di atas kaki dan gunakan bantalan atau fat bar agar posisinya nyaman.',
      'Gulingkan palang hingga tepat di atas pinggul, lalu berbaring datar di lantai dengan lutut tertekuk.',
      'Dorong melalui tumit dan angkat pinggul secara vertikal melalui palang dengan tumpuan pada punggung atas dan tumit.',
      'Ekstensi pinggul sejauh mungkin, peras bokong di puncak selama 1 detik, lalu turunkan kembali secara terkendali.'
    ],
    tips: [
      'Bayangkan menekan lantai dengan tumit untuk memperkuat pola ekstensi pinggul, bukan melengkungkan punggung.',
      'Atur kaki selebar pinggul sehingga lutut membentuk sudut sekitar 90 derajat di puncak gerakan.',
      'Setelah gerakan dasar dikuasai, angkat salah satu kaki dari lantai untuk menambah beban pada sisi lainnya.'
    ],
    commonMistakes: [
      'Mendorong dengan melengkungkan punggung bawah alih-alih memeras bokong hingga punggung terasa pegal.',
      'Meletakkan palang di paha, bukan tepat di atas pinggul, sehingga tekanan terasa tidak nyaman.',
      'Menurunkan pinggul terlalu cepat dan membiarkannya menghantam lantai.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=barbell+glute+bridge+form',
    imageUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Barbell_Glute_Bridge/0.jpg',
    alternatives: [],
  },
  {
    name: 'Dumbbell Floor Press',
    primaryMuscle: MuscleGroup.TRICEPS,
    secondaryMuscles: [MuscleGroup.CHEST, MuscleGroup.SHOULDERS],
    equipment: EquipmentType.DUMBBELL,
    weightIncrement: 2.5,
    steps: [
      'Berbaring di lantai dengan dumbbell di kedua tangan, lutut boleh ditekuk, dan mulai dengan kedua beban lurus di atas dada.',
      'Tahan siku cukup rapat ke tubuh, lalu turunkan beban secara terkendali hingga lengan atas menyentuh lantai.',
      'Berhenti sejenak di posisi bawah saat lengan atas menempel lantai.',
      'Dorong kembali ke atas dengan meluruskan siku dan pertemukan kedua dumbbell di atas dada, lalu ulangi.'
    ],
    tips: [
      'Untuk menekankan triceps, rapatkan siku ke tubuh; untuk lebih fokus ke dada, buka siku sekitar 45 derajat.',
      'Rentang gerak dibatasi lantai sehingga sendi bahu lebih aman saat perlu istirahat dari latihan menekan berat.',
      'Jaga pergelangan tangan netral dan tekan lantai dengan tumit serta tulang belikat agar tubuh stabil.'
    ],
    commonMistakes: [
      'Memantulkan lengan atas di lantai untuk membantu dorongan ke atas.',
      'Membuka siku hampir 90 derajat ke samping sehingga bahu menanggung beban berlebih.',
      'Mengangkat kepala dan punggung bawah dari lantai saat mendorong beban berat.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=dumbbell+floor+press+form',
    imageUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Dumbbell_Floor_Press/0.jpg',
    alternatives: [],
  },
  {
    name: 'Natural Glute Ham Raise',
    primaryMuscle: MuscleGroup.HAMSTRINGS,
    secondaryMuscles: [MuscleGroup.CALVES, MuscleGroup.GLUTES, MuscleGroup.BACK],
    equipment: EquipmentType.BODYWEIGHT,
    weightIncrement: 5,
    steps: [
      'Gunakan bantalan kaki mesin lat pulldown atau bangku preacher, posisikan pergelangan kaki di bawah bantalan dan lutut di kursi, badan membelakangi mesin.',
      'Berdiri tegak dengan postur baik sebagai posisi awal, lalu turunkan badan secara terkendali dengan lutut sebagai poros.',
      'Teruskan turun sampai lutut hampir sepenuhnya lurus sementara otot hamstring menahan berat badan.',
      'Angkat kembali tubuh ke posisi awal dengan mendorong melalui hamstring dan bokong, tetap dalam kendali penuh.',
      'Bila tidak kuat menyelesaikan repetisi, gunakan band, bantuan rekan, atau dorong dari box untuk kembali ke atas.'
    ],
    tips: [
      'Lakukan fase turun selama 3-4 hitungan secara lambat, karena momentum akan menghilangkan manfaat gerakan ini.',
      'Kencangkan otot perut dan bokong sepanjang repetisi agar pinggul tidak tertekuk.',
      'Berlatih pada rentang gerak parsial dulu, lalu perluas seiring hamstring dan bokong makin kuat.'
    ],
    commonMistakes: [
      'Mengayunkan badan di awal gerakan untuk mendapatkan momentum.',
      'Melengkungkan punggung saat menekuk sehingga pinggul mengambil alih kerja hamstring.',
      'Memakai rentang gerak penuh sebelum cukup kuat sehingga Anda terjatuh di posisi bawah.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=natural+glute+ham+raise+form',
    imageUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Natural_Glute_Ham_Raise/0.jpg',
    alternatives: [],
  },
  {
    name: 'Leg Lift',
    primaryMuscle: MuscleGroup.GLUTES,
    secondaryMuscles: [MuscleGroup.HAMSTRINGS],
    equipment: EquipmentType.BODYWEIGHT,
    weightIncrement: 5,
    steps: [
      'Berdiri tegak dengan kaki selebar bahu, lalu pegang rangka squat rack atau sandaran kursi untuk menjaga keseimbangan.',
      'Tegangkan otot perut dan jaga kaki penopang tetap lurus sepanjang gerakan.',
      'Tekuk lutut dan tendang satu kaki ke belakang seperti gerakan leg curl sambil mengembuskan napas.',
      'Tahan kontraksi di puncak selama 1 detik agar bokong benar-benar terasa bekerja.',
      'Turunkan kaki perlahan selama 2 hitungan sambil menarik napas, lalu ulangi dengan kaki satunya.'
    ],
    tips: [
      'Tambahkan ankle weight bila berat badan terasa terlalu ringan untuk menambah beban.',
      'Fokus pada kontraksi bokong, bukan pada seberapa tinggi kaki terangkat.',
      'Biarkan otot hamstring di belakang paha membantu mengangkat kaki dengan halus.'
    ],
    commonMistakes: [
      'Mengayunkan kaki dengan momentum sehingga bokong tidak benar-benar bekerja.',
      'Membungkukkan badan atau melengkungkan punggung saat mengangkat kaki.',
      'Mengunci lutut kaki penopang sampai tegang sehingga berisiko cedera.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=leg+lift+form',
    imageUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Leg_Lift/0.jpg',
    alternatives: [],
  },
  {
    name: 'Calf Press',
    primaryMuscle: MuscleGroup.CALVES,
    secondaryMuscles: [],
    equipment: EquipmentType.MACHINE,
    weightIncrement: 5,
    steps: [
      'Atur posisi dudukan mesin sehingga lutut hanya sedikit tertekuk di posisi awal.',
      'Letakkan bola kaki di tepi platform, lalu pilih beban dan genggam handle di kedua sisi.',
      'Luruskan lutut mendorong platform sampai beban hampir terangkat dari stack pin.',
      'Angkat tumit hingga pergelangan kaki tertekuk penuh dengan jari kaki mengarah ke atas.',
      'Tahan 1 detik di posisi puncak, lalu turunkan tumit perlahan dan ulangi.'
    ],
    tips: [
      'Biarkan tumit menggantung di tepi platform agar peregangan betis lebih maksimal.',
      'Turunkan beban dalam 2 hitungan supaya otot betis meregang penuh.',
      'Tetap rapat ke sandaran dan jangan biarkan bokong terangkat dari dudukan.'
    ],
    commonMistakes: [
      'Menekuk lutut terlalu banyak sehingga gerakan berubah menjadi leg press.',
      'Memakai rentang gerak pendek hanya di ujung atas tanpa menurunkan tumit sepenuhnya.',
      'Membiarkan lutut mengunci keras pada setiap repetisi sehingga sendi cepat lelah.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=calf+press+form',
    imageUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Calf_Press/0.jpg',
    alternatives: [],
  },
  {
    name: 'Finger Curls',
    primaryMuscle: MuscleGroup.FOREARMS,
    secondaryMuscles: [],
    equipment: EquipmentType.BARBELL,
    weightIncrement: 2.5,
    steps: [
      'Pegang palang dengan kedua tangan, telapak menghadap ke atas, dan jarak tangan selebar bahu.',
      'Berdiri dengan kaki sedikit lebih lebar dari bahu dan telapak kaki menapak rata di lantai.',
      'Buka jari perlahan sehingga palang menggelinding turun sampai tertahan di lipatan terakhir jari.',
      'Gulirkan palang kembali ke atas dengan menutup kepalan sambil mengembuskan napas.',
      'Tahan kontraksi kepalan di posisi atas selama 1 detik, lalu ulangi.'
    ],
    tips: [
      'Mulailah dengan beban ringan karena otot jari dan lengan bawah cepat lelah.',
      'Fokus pada gerakan menutup jari, bukan mengangkat palang dengan pergelangan tangan.',
      'Jaga siku tetap lurus dan diam sepanjang set.'
    ],
    commonMistakes: [
      'Memakai beban terlalu berat sehingga palang tidak bisa menggelinding lepas dari jari.',
      'Mengangkat palang dengan bahu atau punggung, bukan dengan menutup jari.',
      'Membiarkan pergelangan tangan ikut menekuk seperti sedang wrist curl.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=finger+curls+form',
    imageUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Finger_Curls/0.jpg',
    alternatives: [],
  },
  {
    name: 'Hammer Curls',
    primaryMuscle: MuscleGroup.BICEPS,
    secondaryMuscles: [],
    equipment: EquipmentType.DUMBBELL,
    weightIncrement: 2.5,
    steps: [
      'Berdiri tegak dengan dumbbell di masing-masing tangan dan lengan tergantung lurus di sisi tubuh.',
      'Hadapkan telapak tangan ke dalam menghadap tubuh dengan grip netral, lalu rapatkan siku ke sisi badan.',
      'Tekuk siku dan angkat dumbbell sampai setinggi bahu sambil mengembuskan napas.',
      'Tahan posisi terkontraksi 1 detik sambil meremas bisep dan lengan bawah.',
      'Turunkan dumbbell perlahan selama 2 hitungan sambil menarik napas.'
    ],
    tips: [
      'Jaga siku tetap diam di sisi tubuh dan hanya gerakkan lengan bawah.',
      'Lakukan kedua tangan bersamaan atau bergantian tanpa mengayunkan badan.',
      'Remas dumbbell lebih kuat di puncak untuk menambah aktivasi lengan bawah.'
    ],
    commonMistakes: [
      'Mengayunkan badan atau memakai momentum pinggul untuk mengangkat beban.',
      'Membiarkan siku maju ke depan sehingga bisep kehilangan ketegangan.',
      'Menurunkan beban terlalu cepat sampai otot tidak bekerja di fase turun.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=hammer+curls+form',
    imageUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Hammer_Curls/0.jpg',
    alternatives: [],
  },
  {
    name: 'Thigh Abductor',
    primaryMuscle: MuscleGroup.GLUTES,
    secondaryMuscles: [],
    equipment: EquipmentType.MACHINE,
    weightIncrement: 5,
    steps: [
      'Duduk di mesin abduktor, atur beban sesuai kemampuan, dan posisikan kaki di bantalan.',
      'Genggam handle di kedua sisi dan pastikan seluruh tubuh bagian atas tetap diam.',
      'Buka kedua kaki ke luar melawan bantalan sambil mengembuskan napas.',
      'Rasakan kontraksi di sisi bokong selama 1 detik, lalu kembali ke posisi awal sambil menarik napas.',
      'Ulangi sesuai repetisi yang ditargetkan tanpa mengubah posisi duduk.'
    ],
    tips: [
      'Jaga punggung menempel di sandaran dan otot perut tetap tegang selama gerakan.',
      'Gerakkan kaki dengan lambat, bukan menyentak ke samping.',
      'Kurangi beban bila pinggul mulai terangkat dari dudukan.'
    ],
    commonMistakes: [
      'Mencondongkan badan ke belakang dan memakai momentum saat membuka kaki.',
      'Membiarkan lutut naik-turun sehingga bantalan bergeser dari posisi tepat.',
      'Menutup kaki terlalu cepat tanpa menahan kontraksi di sisi luar.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=thigh+abductor+form',
    imageUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Thigh_Abductor/0.jpg',
    alternatives: [],
  },
  {
    name: '90/90 Hamstring',
    primaryMuscle: MuscleGroup.HAMSTRINGS,
    secondaryMuscles: [MuscleGroup.CALVES],
    equipment: EquipmentType.BODYWEIGHT,
    weightIncrement: 5,
    steps: [
      'Berbaring telentang dengan satu kaki lurus sepenuhnya menempel di lantai.',
      'Tekuk pinggul dan lutut kaki lainnya sampai membentuk sudut 90 derajat, boleh dibantu tangan.',
      'Luruskan kaki tertekuk ke atas sampai penuh dan tahan sebentar di puncak.',
      'Kembalikan kaki ke posisi 90 derajat dengan kontrol, lalu ulangi 10-20 repetisi.',
      'Setelah satu sisi selesai, ganti ke kaki satunya.'
    ],
    tips: [
      'Jaga punggung bawah tetap menempel di lantai dengan menegangkan otot perut.',
      'Lakukan gerakan dengan tempo lambat agar hamstring benar-benar meregang dan bekerja.',
      'Luruskan kaki penopang di lantai untuk menstabilkan posisi pinggul.'
    ],
    commonMistakes: [
      'Mengangkat punggung bawah dari lantai saat meluruskan kaki ke atas.',
      'Menendang kaki dengan cepat sehingga gerakan bergantung pada momentum.',
      'Menekuk lutut saat kaki diluruskan sehingga hamstring kurang terlatih.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=90+90+hamstring+form',
    imageUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/90_90_Hamstring/0.jpg',
    alternatives: [],
  },
  {
    name: 'Cable Wrist Curl',
    primaryMuscle: MuscleGroup.FOREARMS,
    secondaryMuscles: [],
    equipment: EquipmentType.CABLE,
    weightIncrement: 2.5,
    steps: [
      'Letakkan bangku datar di depan pulley bawah yang dipasangi palang lurus.',
      'Genggam palang dengan grip supinasi yaitu telapak menghadap ke atas, selebar bahu sampai selebar pinggul.',
      'Sandarkan lengan bawah di atas paha sehingga pergelangan tangan menggantung di luar lutut.',
      'Tekuk pergelangan ke atas melawan tarikan kabel sambil mengembuskan napas, tahan 1 detik.',
      'Turunkan pergelangan perlahan ke posisi awal sambil menarik napas.'
    ],
    tips: [
      'Jaga lengan bawah menempel di paha dan jadikan pergelangan satu-satunya sendi yang bergerak.',
      'Turunkan beban sampai jari membuka lebar untuk memperluas rentang gerak.',
      'Pilih beban ringan dengan repetisi lebih tinggi karena otot lengan bawah berukuran kecil.'
    ],
    commonMistakes: [
      'Mengangkat siku dari paha sehingga gerakan berubah menjadi curl bisep.',
      'Hanya memakai sebagian rentang gerak di ujung atas.',
      'Menghentak beban dengan pergelangan di awal gerakan sehingga otot tidak terkendali.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=cable+wrist+curl+form',
    imageUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Cable_Wrist_Curl/0.jpg',
    alternatives: [],
  },
  {
    name: 'Triceps Pushdown',
    primaryMuscle: MuscleGroup.TRICEPS,
    secondaryMuscles: [],
    equipment: EquipmentType.CABLE,
    weightIncrement: 2.5,
    steps: [
      'Pasang palang lurus atau palang tekuk di pulley atas, lalu genggam dengan grip overhand selebar bahu.',
      'Berdiri tegak dengan sedikit condong ke depan, rapatkan lengan atas ke sisi tubuh dan tegak lurus lantai.',
      'Dorong palang ke bawah hingga menyentuh paha depan dengan lengan lurus sepenuhnya.',
      'Tahan kontraksi di posisi bawah selama 1 detik sambil mengembuskan napas.',
      'Naikkan palang perlahan ke posisi awal sambil menarik napas, jaga lengan atas tetap diam.'
    ],
    tips: [
      'Kunci siku di sisi tubuh dan bayangkan lengan atas seperti engsel yang tidak bergeser.',
      'Pertahankan sedikit condong ke depan agar kabel tidak menarik badan Anda ke belakang.',
      'Rasakan ketegangan di belakang lengan atas, bukan di punggung atau bahu.'
    ],
    commonMistakes: [
      'Mendorong dengan berat badan dan bahu sehingga trisep tidak bekerja.',
      'Membiarkan siku terbuka ke samping sampai arah gerakan menyimpang.',
      'Naik terlalu cepat sehingga kabel menarik lengan ke atas tanpa kontrol.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=triceps+pushdown+form',
    imageUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Triceps_Pushdown/0.jpg',
    alternatives: [],
  },
  {
    name: 'Dumbbell Side Bend',
    primaryMuscle: MuscleGroup.ABS,
    secondaryMuscles: [],
    equipment: EquipmentType.DUMBBELL,
    weightIncrement: 2.5,
    steps: [
      'Berdiri tegak dengan dumbbell di tangan kiri dan tangan kanan menempel di pinggang.',
      'Letakkan kaki selebar bahu, punggung lurus, dan pandangan mengarah ke depan.',
      'Tekuk badan ke sisi kanan melalui pinggang sejauh mungkin sambil menarik napas.',
      'Tahan posisi miring 1 detik, lalu kembali tegak sambil mengembuskan napas.',
      'Ulangi ke arah kiri, lalu ganti tangan setelah menyelesaikan repetisi.'
    ],
    tips: [
      'Bayangkan tubuh hanya tertekuk di pinggang dan tidak membungkuk ke depan atau ke belakang.',
      'Gerakan lambat memberi otot samping perut waktu untuk berkontraksi penuh.',
      'Genggam dumbbell dengan mantap agar mudah dikendalikan saat kembali tegak.'
    ],
    commonMistakes: [
      'Memutar badan sehingga gerakan berubah menjadi rotasi, bukan tekukan ke samping.',
      'Membungkuk ke depan sehingga beban berpindah dari sisi perut.',
      'Memakai dumbbell terlalu berat sampai gerakan jadi mengayun.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=dumbbell+side+bend+form',
    imageUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Dumbbell_Side_Bend/0.jpg',
    alternatives: [],
  },
  {
    name: 'Reverse Cable Curl',
    primaryMuscle: MuscleGroup.BICEPS,
    secondaryMuscles: [MuscleGroup.FOREARMS],
    equipment: EquipmentType.CABLE,
    weightIncrement: 2.5,
    steps: [
      'Berdiri tegak menghadap pulley bawah dengan palang lurus dan grip pronasi yaitu telapak menghadap ke bawah selebar bahu.',
      'Rapatkan siku ke sisi tubuh dan pastikan lengan atas tetap diam.',
      'Tekuk siku mengangkat palang sampai setinggi bahu sambil mengembuskan napas.',
      'Tahan posisi terkontraksi 1 detik sambil meremas bisep dan lengan bawah.',
      'Turunkan palang perlahan ke posisi awal sambil menarik napas.'
    ],
    tips: [
      'Grip pronasi menambah beban pada lengan bawah dan otot di sisi atas lengan.',
      'Hanya lengan bawah yang bergerak, siku tetap menempel di sisi badan.',
      'Pakailah beban lebih ringan dari curl biasa karena grip ini terasa lebih sulit.'
    ],
    commonMistakes: [
      'Mengayunkan badan atau menarik beban dengan bantuan bahu.',
      'Membiarkan pergelangan tangan menekuk naik-turun sendiri selama gerakan.',
      'Memakai beban terlalu berat sampai siku terbuka ke samping.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=reverse+cable+curl+form',
    imageUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Reverse_Cable_Curl/0.jpg',
    alternatives: [],
  },
  {
    name: 'Concentration Curls',
    primaryMuscle: MuscleGroup.BICEPS,
    secondaryMuscles: [MuscleGroup.FOREARMS],
    equipment: EquipmentType.DUMBBELL,
    weightIncrement: 2.5,
    steps: [
      'Duduk di ujung bangku datar dengan kaki terbuka, lutut tertekuk, dan dumbbell di antara kaki.',
      'Ambil dumbbell dengan tangan kanan dan sandarkan belakang lengan atas di bagian dalam paha kanan.',
      'Putar telapak menghadap ke depan menjauhi paha dan luruskan lengan ke bawah.',
      'Tekuk siku mengangkat dumbbell sampai setinggi bahu sambil mengembuskan napas.',
      'Tahan 1 detik di puncak dengan jari kelingking lebih tinggi dari ibu jari, lalu turunkan perlahan.'
    ],
    tips: [
      'Sandaran paha mengunci lengan atas sehingga bisep bekerja tanpa bantuan badan.',
      'Kunci siku tetap di tempat dan hanya lengan bawah yang berputar.',
      'Kerjakan satu tangan pada satu waktu agar kontraksi lebih maksimal.'
    ],
    commonMistakes: [
      'Mengayunkan dumbbell atau mengangkat siku dari paha saat menaikkan beban.',
      'Membiarkan pergelangan menekuk sampai ibu jari lebih tinggi dari kelingking.',
      'Menurunkan beban terlalu cepat tanpa menahan fase turun.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=concentration+curls+form',
    imageUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Concentration_Curls/0.jpg',
    alternatives: [],
  },
  {
    name: 'Smith Machine Hip Raise',
    primaryMuscle: MuscleGroup.ABS,
    secondaryMuscles: [],
    equipment: EquipmentType.MACHINE,
    weightIncrement: 5,
    steps: [
      'Atur bangku di dalam rak Smith Machine dan bebani palang sesuai kemampuan.',
      'Berbaring di bangku dengan telapak kaki menekan palang, buka kunci bar, lalu luruskan kaki.',
      'Genggam rangka Smith Machine di kedua sisi untuk menstabilkan tubuh.',
      'Putar panggul dan tekuk tulang punggung untuk mengangkat pinggul dari bangku.',
      'Tahan sebentar di atas, lalu turunkan pinggul kembali ke bangku dengan kontrol.'
    ],
    tips: [
      'Pertahankan lutut sedikit tertekuk sepanjang gerakan untuk melindungi sendi.',
      'Jadikan otot perut bagian bawah penggerak utama, bukan kaki.',
      'Turunkan pinggul dengan lambat supaya tidak menghantam bangku.'
    ],
    commonMistakes: [
      'Mendorong palang dengan kaki seperti leg press sehingga perut tidak bekerja.',
      'Mengangkat pinggul dengan mengayun punggung hingga berisiko pada tulang belakang.',
      'Memakai rentang gerak terlalu pendek sehingga kontraksi perut minim.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=smith+machine+hip+raise+form',
    imageUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Smith_Machine_Hip_Raise/0.jpg',
    alternatives: [],
  },
  {
    name: 'Barbell Seated Calf Raise',
    primaryMuscle: MuscleGroup.CALVES,
    secondaryMuscles: [],
    equipment: EquipmentType.BARBELL,
    weightIncrement: 2.5,
    steps: [
      'Letakkan balok setinggi sekitar 30 cm di depan bangku datar.',
      'Duduk di bangku dan taruh bola kaki di atas balok dengan tumit menggantung bebas.',
      'Minta bantuan menaruh palang di atas paha sekitar 7 cm di atas lutut, lalu tahan di sana.',
      'Angkat tumit setinggi mungkin sambil meremas betis dan mengembuskan napas.',
      'Tahan kontraksi 1 detik, lalu turunkan tumit perlahan sampai betis meregang penuh.'
    ],
    tips: [
      'Tekan palang dengan tangan agar tidak bergeser dari posisi di atas paha.',
      'Turunkan tumit sejauh mungkin untuk memperoleh rentang gerak maksimal.',
      'Gunakan tempo lambat agar bukan pantulan yang mengangkat beban.'
    ],
    commonMistakes: [
      'Memantulkan tumit di bawah sehingga otot betis tidak bekerja penuh.',
      'Memakai balok terlalu tinggi sampai pergelangan kaki tidak stabil.',
      'Menekuk lutut atau mengangkat paha saat mendorong beban.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=barbell+seated+calf+raise+form',
    imageUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Barbell_Seated_Calf_Raise/0.jpg',
    alternatives: [],
  },
  {
    name: 'Low Cable Triceps Extension',
    primaryMuscle: MuscleGroup.TRICEPS,
    secondaryMuscles: [],
    equipment: EquipmentType.CABLE,
    weightIncrement: 2.5,
    steps: [
      'Pilih beban lalu berbaring telentang di bangku mesin seated row yang dipasangi tali.',
      'Posisikan kepala menghadap attachment dan genggam kedua ujung tali dengan grip netral.',
      'Tekuk siku 90 derajat dengan lengan atas tegak lurus tubuh dan mengarah ke langit-langit.',
      'Luruskan lengan bawah sampai tegak vertikal sambil mengembuskan napas.',
      'Tahan kontraksi trisep 1 detik, lalu kembali ke posisi awal sambil menarik napas.'
    ],
    tips: [
      'Rapatkan siku ke dalam dan jaga lengan atas tetap mengarah ke langit-langit sepanjang set.',
      'Buka ujung tali sedikit ke samping di akhir gerakan untuk kontraksi yang lebih kuat.',
      'Hanya lengan bawah yang bergerak, siku dan lengan atas tetap diam.'
    ],
    commonMistakes: [
      'Membiarkan siku melebar atau turun sehingga gerakan berubah menjadi press.',
      'Mengangkat beban dengan bahu dan punggung, bukan dengan trisep.',
      'Memakai rentang gerak pendek tanpa meluruskan lengan sepenuhnya.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=low+cable+triceps+extension+form',
    imageUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Low_Cable_Triceps_Extension/0.jpg',
    alternatives: [],
  },
  {
    name: 'Rocking Standing Calf Raise',
    primaryMuscle: MuscleGroup.CALVES,
    secondaryMuscles: [],
    equipment: EquipmentType.BARBELL,
    weightIncrement: 2.5,
    steps: [
      'Pegang palang dengan kedua tangan di sisi, angkat dari rak dengan mendorong kaki sambil menegakkan badan.',
      'Mundur dari rak dan berdiri dengan kaki selebar bahu, ujung kaki sedikit mengarah ke luar.',
      'Jaga pandangan ke depan, punggung lurus, dan lutut sedikit tertekuk tanpa dikunci.',
      'Angkat tumit setinggi mungkin dengan meluruskan pergelangan sambil mengembuskan napas, tahan 1 detik.',
      'Turunkan tumit perlahan sampai betis meregang, lalu angkat ujung kaki dengan mengontraksikan otot depan betis.'
    ],
    tips: [
      'Jaga lutut tetap pada posisi yang sama sepanjang gerakan, tidak ikut menekuk atau lurus.',
      'Pandangan ke depan mencegah tubuh kehilangan keseimbangan saat tumit diangkat.',
      'Fase mengangkat ujung kaki melatih otot tibialis di depan tulang kering.'
    ],
    commonMistakes: [
      'Menekuk lutut seperti gerakan squat saat mengangkat tumit.',
      'Mencondongkan badan ke depan sampai beban berpindah dari betis.',
      'Memantulkan tumit di bawah alih-alih meregangkan betis dengan kontrol.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=rocking+standing+calf+raise+form',
    imageUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Rocking_Standing_Calf_Raise/0.jpg',
    alternatives: [],
  },
  {
    name: 'Dumbbell Seated One-Leg Calf Raise',
    primaryMuscle: MuscleGroup.CALVES,
    secondaryMuscles: [],
    equipment: EquipmentType.DUMBBELL,
    weightIncrement: 2.5,
    steps: [
      'Letakkan balok di lantai sekitar 30 cm di depan bangku datar.',
      'Duduk di bangku dan taruh dumbbell di atas paha kiri sekitar 7 cm di atas lutut.',
      'Letakkan bola kaki kiri di atas balok dengan tumit menggantung bebas.',
      'Angkat tumit setinggi mungkin sambil mengembuskan napas dan tahan kontraksi 1 detik.',
      'Turunkan tumit perlahan sampai betis meregang penuh, lalu ulangi dan ganti kaki.'
    ],
    tips: [
      'Tahan dumbbell dengan tangan agar tetap stabil di atas paha.',
      'Bekerja satu kaki memberi rentang gerak lebih besar dengan beban lebih terkontrol.',
      'Turunkan tumit sedalam mungkin untuk peregangan betis yang maksimal.'
    ],
    commonMistakes: [
      'Memakai dumbbell terlalu berat sehingga pergelangan kaki goyah.',
      'Memantulkan tumit cepat-cepat sehingga bukan otot yang bekerja.',
      'Meletakkan dumbbell terlalu dekat lutut sehingga posisi terasa tidak nyaman.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=dumbbell+seated+one+leg+calf+raise+form',
    imageUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Dumbbell_Seated_One-Leg_Calf_Raise/0.jpg',
    alternatives: [],
  },
  {
    name: 'Seated Dumbbell Palms-Up Wrist Curl',
    primaryMuscle: MuscleGroup.FOREARMS,
    secondaryMuscles: [],
    equipment: EquipmentType.DUMBBELL,
    weightIncrement: 2.5,
    steps: [
      'Letakkan dua dumbbell di lantai tepat di depan bangku datar.',
      'Duduk di tepi bangku dengan kaki selebar bahu dan telapak kaki menapak di lantai.',
      'Angkat kedua dumbbell dan sandarkan lengan bawah di atas paha dengan telapak menghadap ke atas.',
      'Biarkan pergelangan tangan menggantung bebas melewati tepi paha Anda.',
      'Tekuk pergelangan ke atas sambil mengembuskan napas, lalu turunkan perlahan sambil menarik napas.'
    ],
    tips: [
      'Lengan bawah harus tetap diam dan hanya pergelangan yang bergerak.',
      'Tekuk pergelangan sampai jari menggulung ke bawah untuk rentang gerak penuh.',
      'Gunakan 12-20 repetisi karena otot lengan bawah cepat lelah.'
    ],
    commonMistakes: [
      'Mengangkat siku dari paha sehingga gerakan menjadi curl biasa.',
      'Memakai beban terlalu berat sampai rentang gerak pergelangan berkurang.',
      'Mengayunkan beban dengan cepat tanpa menahan kontraksi di atas.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=seated+dumbbell+palms+up+wrist+curl+form',
    imageUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Seated_Dumbbell_Palms-Up_Wrist_Curl/0.jpg',
    alternatives: [],
  },
  {
    name: 'Calf Raise On A Dumbbell',
    primaryMuscle: MuscleGroup.CALVES,
    secondaryMuscles: [],
    equipment: EquipmentType.DUMBBELL,
    weightIncrement: 2.5,
    steps: [
      'Pegang benda kokoh untuk keseimbangan dan berdiri dengan bola kaki di atas handle dumbbell.',
      'Gulirkan kaki sedikit ke depan sampai betis meregang, jadikan posisi ini titik awal.',
      'Angkat tumit dengan menggulirkan kaki melewati bagian atas handle sampai ekstensi penuh.',
      'Tahan kontraksi betis 1 detik di puncak sambil mengembuskan napas.',
      'Gulirkan dumbbell sedikit ke depan saat turun untuk memperbesar peregangan, lalu ulangi.'
    ],
    tips: [
      'Pilih dumbbell berpelat bulat karena bergulir membuat otot betis bekerja lebih keras menstabilkan.',
      'Saat naik gulirkan dumbbell sedikit ke belakang, saat turun sedikit ke depan.',
      'Genggam tumpuan dengan kuat dan jaga siku tetap lurus sepanjang set.'
    ],
    commonMistakes: [
      'Menaruh kaki di tengah handle sehingga dumbbell berputar dan kaki terpeleset.',
      'Melewatkan peregangan turun penuh dan hanya menghentak di ujung atas.',
      'Melepas pegangan dari tumpuan sehingga keseimbangan tubuh langsung hilang.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=calf+raise+on+a+dumbbell+form',
    imageUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Calf_Raise_On_A_Dumbbell/0.jpg',
    alternatives: [],
  },
  {
    name: 'One-Legged Cable Kickback',
    primaryMuscle: MuscleGroup.GLUTES,
    secondaryMuscles: [MuscleGroup.HAMSTRINGS],
    equipment: EquipmentType.CABLE,
    weightIncrement: 2.5,
    steps: [
      'Pasang ankle cuff pada pulley bawah, lalu kaitkan cuff di pergelangan kaki kerja.',
      'Berdiri menghadap tumpukan beban sekitar setengah meter dan genggam rangka besi sebagai tumpuan.',
      'Tekuk lutut dan pinggul sedikit, tegangkan otot perut, lalu tendang kaki kerja ke belakang membentuk busur.',
      'Kencangkan bokong 1 detik di titik ekstensi penuh sambil mengembuskan napas.',
      'Majukan kaki kerja perlahan menahan tarikan kabel sampai kembali ke posisi awal.',
      'Ulangi sesuai repetisi, lalu ganti kaki dan lakukan sisi lainnya.'
    ],
    tips: [
      'Jaga punggung tetap netral dan jangan melengkungkan pinggang saat menendang ke belakang.',
      'Biarkan tubuh tetap tegak dan hanya kaki kerja yang bergerak.',
      'Tendang sedikit ke arah diagonal agar bokong berkontraksi lebih lengkap dengan bantuan hamstring.'
    ],
    commonMistakes: [
      'Melengkungkan punggung bawah dan mengayun kaki supaya bisa menendang lebih tinggi.',
      'Memakai beban terlalu berat sehingga badan tertarik ke depan oleh kabel.',
      'Menendang melebihi rentang nyaman sehingga panggul memutar berlebihan.'
    ],
    videoUrl: 'https://www.youtube.com/results?search_query=one+legged+cable+kickback+form',
    imageUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/One-Legged_Cable_Kickback/0.jpg',
    alternatives: [],
  },
];
