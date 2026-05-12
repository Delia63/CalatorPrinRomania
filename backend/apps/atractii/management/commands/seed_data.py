from django.core.management.base import BaseCommand
from apps.atractii.models import AtractieTuristica
from apps.regiuni.models import PreparatLocal, Festival
from apps.utilizatori.models import Badge
from apps.trasee.models import Traseu, PunctTraseu


class Command(BaseCommand):
    help = 'Populează baza de date cu date de test pentru CalatorPrinRomania'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Șterge datele existente înainte de a adăuga altele noi',
        )

    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write('Șterg datele existente...')
            AtractieTuristica.objects.all().delete()
            PreparatLocal.objects.all().delete()
            Festival.objects.all().delete()
            Badge.objects.all().delete()
    
            Traseu.objects.filter(estePrestabilit=True).delete()

            self.stdout.write(self.style.WARNING('Date șterse!'))

        self._seed_atractii()
        self._seed_preparate()
        self._seed_festivaluri()
        self._seed_badge_uri()
        self._seed_trasee_prestabilite()

        self.stdout.write(self.style.SUCCESS('Date de test adăugate cu succes!'))

    def _seed_atractii(self):
        atractii = [
            # === CASTELE ===
            {
                'nume': 'Castelul Bran',
                'descriere': 'Cunoscut drept "Castelul lui Dracula", este unul dintre cele mai vizitate obiective turistice din România.',
                'tip': 'castel',
                'latitudine': 45.5150,
                'longitudine': 25.3670,
                'programVizitare': 'Luni: 12:00-18:00, Marți-Duminică: 09:00-18:00',
                'tarif': 50,
                'curiozitate': 'Ce castel din Brașov este asociat cu legenda lui Dracula, deși Vlad Țepeș nu a locuit niciodată aici?',
            },
            {
                'nume': 'Castelul Peleș',
                'descriere': 'Castel neorenascentist din Sinaia, fost reședință regală a României.',
                'tip': 'castel',
                'latitudine': 45.3600,
                'longitudine': 25.5420,
                'programVizitare': 'Miercuri-Duminică: 09:15-16:15',
                'tarif': 50,
                'curiozitate': 'Ce castel din Sinaia a fost primul din Europa iluminat integral cu electricitate?',
            },
            {
                'nume': 'Castelul Corvinilor',
                'descriere': 'Castel gotic din Hunedoara, unul dintre cele mai mari castele din Europa.',
                'tip': 'castel',
                'latitudine': 45.7489,
                'longitudine': 22.8881,
                'programVizitare': 'Zilnic: 09:00-17:00',
                'tarif': 40,
                'curiozitate': 'Ce castel gotic din Hunedoara se spune că l-a ținut prizonier pe Vlad Țepeș timp de 7 ani?',
            },
            {
                'nume': 'Cetatea Alba Carolina',
                'descriere': 'Cetate bastionară de tip Vauban, cea mai mare din România.',
                'tip': 'cetate',
                'latitudine': 46.0667,
                'longitudine': 23.5700,
                'programVizitare': 'Non-stop (exterior), Muzeu: 10:00-18:00',
                'tarif': 0,
                'curiozitate': 'Ce cetate în formă de stea din Alba Iulia a fost locul Marii Uniri din 1918?',
            },
            # === BISERICI ȘI MĂNĂSTIRI ===
            {
                'nume': 'Mănăstirea Voroneț',
                'descriere': 'Cunoscută drept "Capela Sixtină a Estului" datorită frescelor sale exterioare.',
                'tip': 'biserică',
                'latitudine': 47.5167,
                'longitudine': 25.8667,
                'programVizitare': 'Zilnic: 08:00-18:00',
                'tarif': 10,
                'curiozitate': 'Ce mănăstire din Bucovina este numită "Capela Sixtină a Estului" datorită albastului unic al frescelor?',
            },
            {
                'nume': 'Mănăstirea Sucevița',
                'descriere': 'Mănăstire fortificată din Bucovina cu fresce exterioare bine conservate.',
                'tip': 'biserică',
                'latitudine': 47.7833,
                'longitudine': 25.7167,
                'programVizitare': 'Zilnic: 09:00-17:00',
                'tarif': 10,
                'curiozitate': 'Ce mănăstire fortificată din Bucovina are cea mai mare suprafață de fresce exterioare din Moldova?',
            },
            {
                'nume': 'Biserica Neagră',
                'descriere': 'Cea mai mare biserică în stil gotic din sud-estul Europei, situată în Brașov.',
                'tip': 'biserică',
                'latitudine': 45.6403,
                'longitudine': 25.5887,
                'programVizitare': 'Luni-Sâmbătă: 10:00-17:00',
                'tarif': 15,
                'curiozitate': 'Ce biserică gotică din Brașov și-a primit numele după un incendiu devastator din 1689?',
            },
            # === PEȘTERI ===
            {
                'nume': 'Peștera Scărișoara',
                'descriere': 'Adăpostește cel mai mare ghețar subteran din România.',
                'tip': 'peșteră',
                'latitudine': 46.4903,
                'longitudine': 22.8133,
                'programVizitare': 'Marți-Duminică: 09:00-17:00',
                'tarif': 20,
                'curiozitate': 'Ce peșteră din Munții Apuseni adăpostește un ghețar subteran vechi de peste 3.500 de ani?',
            },
            {
                'nume': 'Peștera Muierilor',
                'descriere': 'Peșteră cu stalactite și stalagmite spectaculoase din Gorj.',
                'tip': 'peșteră',
                'latitudine': 45.1667,
                'longitudine': 23.7167,
                'programVizitare': 'Zilnic: 09:00-17:00',
                'tarif': 15,
                'curiozitate': 'Ce peșteră din Gorj și-a primit numele de la femeile care se ascundeau aici în timpul invaziilor otomane?',
            },
            # === NATURĂ ===
            {
                'nume': 'Salina Turda',
                'descriere': 'Mină de sare transformată în parc de distracții subteran, unică în lume.',
                'tip': 'mină',
                'latitudine': 46.5870,
                'longitudine': 23.7860,
                'programVizitare': 'Zilnic: 09:00-17:00',
                'tarif': 50,
                'curiozitate': 'Ce mină de sare din Transilvania a fost transformată într-un parc de distracții subteran unic în lume?',
            },
            {
                'nume': 'Transfăgărășanul',
                'descriere': 'Cel mai spectaculos drum din România, traversând Munții Făgăraș.',
                'tip': 'drum',
                'latitudine': 45.5986,
                'longitudine': 24.6153,
                'programVizitare': 'Deschis iunie-octombrie (în funcție de vreme)',
                'tarif': 0,
                'curiozitate': 'Ce drum montan din România a fost numit de Top Gear "cel mai frumos drum din lume"?',
            },
            {
                'nume': 'Lacul Sfânta Ana',
                'descriere': 'Singurul lac vulcanic din România, situat în craterul vulcanului Ciomatu.',
                'tip': 'lac',
                'latitudine': 46.1281,
                'longitudine': 25.8800,
                'programVizitare': 'Non-stop',
                'tarif': 5,
                'curiozitate': 'Ce lac din Harghita este singurul lac vulcanic din sud-estul Europei?',
            },
            # === MUZEE ===
            {
                'nume': 'Muzeul ASTRA',
                'descriere': 'Cel mai mare muzeu în aer liber din România, situat în Sibiu.',
                'tip': 'muzeu',
                'latitudine': 45.7700,
                'longitudine': 24.1167,
                'programVizitare': 'Marți-Duminică: 10:00-18:00',
                'tarif': 30,
                'curiozitate': 'Ce muzeu în aer liber din Sibiu prezintă peste 300 de construcții tradiționale din toată România?',
            },
            {
                'nume': 'Muzeul Satului',
                'descriere': 'Muzeu etnografic în aer liber din București, cu gospodării tradiționale.',
                'tip': 'muzeu',
                'latitudine': 44.4725,
                'longitudine': 26.0767,
                'programVizitare': 'Marți-Duminică: 09:00-17:00',
                'tarif': 20,
                'curiozitate': 'Ce muzeu din București aflat pe malul lacului Herăstrău prezintă case țărănești din toate regiunile țării?',
            },
            {
                'nume': 'Sfinxul Bucegilor',
                'descriere': 'Formațiune stâncoasă naturală care seamănă cu un sfinx, situată la 2.216m altitudine.',
                'tip': 'formațiune naturală',
                'latitudine': 45.4000,
                'longitudine': 25.4500,
                'programVizitare': 'Non-stop',
                'tarif': 0,
                'curiozitate': 'Ce formațiune stâncoasă din Bucegi, la peste 2.200m altitudine, seamănă cu capul unui sfinx?',
            },
            # === CASTELE & CETĂȚI SUPLIMENTARE ===
            {
                'nume': 'Castelul Cantacuzino',
                'descriere': 'Castel în stil neoromânesc construit în 1911, situat în Bușteni, la poalele Bucegilor.',
                'tip': 'castel', 'latitudine': 45.4100, 'longitudine': 25.5400,
                'programVizitare': 'Zilnic: 10:00-18:00', 'tarif': 35,
                'curiozitate': 'Ce castel din Bușteni a aparținut familiei Cantacuzino și este celebru pentru arhitectura sa neoromânească?',
            },
            {
                'nume': 'Cetatea Medievală Sighișoara',
                'descriere': 'Unul dintre cele mai bine conservate orașe medievale locuite din Europa, patrimoniu UNESCO, locul nașterii lui Vlad Țepeș.',
                'tip': 'cetate', 'latitudine': 46.2197, 'longitudine': 24.7928,
                'programVizitare': 'Non-stop (exterior), Turn: 09:00-18:00', 'tarif': 10,
                'curiozitate': 'Ce cetate medievală din Transilvania, locul nașterii lui Vlad Țepeș, este înscrisă în patrimoniul UNESCO?',
            },
            {
                'nume': 'Cetatea Râșnov',
                'descriere': 'Cetate țărănească medievală cu vedere panoramică asupra văii Bârsei, construită ca refugiu împotriva invaziilor.',
                'tip': 'cetate', 'latitudine': 45.5883, 'longitudine': 25.4583,
                'programVizitare': 'Zilnic: 09:00-18:00', 'tarif': 15,
                'curiozitate': 'Ce cetate din județul Brașov a fost construită de locuitorii orașului ca refugiu împotriva invaziilor tătare și otomane?',
            },
            {
                'nume': 'Cetatea Histria',
                'descriere': 'Cel mai vechi oraș de pe teritoriul României, colonie greacă fondată în secolul VII î.Hr., pe malul Mării Negre.',
                'tip': 'cetate', 'latitudine': 44.5500, 'longitudine': 28.7833,
                'programVizitare': 'Marți-Duminică: 09:00-17:00', 'tarif': 15,
                'curiozitate': 'Ce cetate antică de lângă Constanța este cel mai vechi oraș atestat documentar de pe teritoriul României?',
            },
            {
                'nume': 'Cetatea Sucevei',
                'descriere': 'Ruinele cetății de scaun a Moldovei medievale, fostă reședință a lui Ștefan cel Mare.',
                'tip': 'cetate', 'latitudine': 47.6667, 'longitudine': 26.2500,
                'programVizitare': 'Marți-Duminică: 10:00-18:00', 'tarif': 10,
                'curiozitate': 'Ce cetate din Bucovina a fost capitala Moldovei medievale și reședința lui Ștefan cel Mare?',
            },
            # === MĂNĂSTIRI SUPLIMENTARE ===
            {
                'nume': 'Mănăstirea Putna',
                'descriere': 'Ctitorie a lui Ștefan cel Mare, loc de veci al marelui voievod moldovean, simbol al spiritualității românești.',
                'tip': 'mănăstire', 'latitudine': 47.8667, 'longitudine': 25.6000,
                'programVizitare': 'Zilnic: 06:00-20:00', 'tarif': 0,
                'curiozitate': 'Ce mănăstire din Bucovina este ctitoria și locul de veci al lui Ștefan cel Mare?',
            },
            {
                'nume': 'Mănăstirea Curtea de Argeș',
                'descriere': 'Capodoperă a arhitecturii medievale românești, ctitorie a lui Neagoe Basarab, loc de veci al regilor României.',
                'tip': 'mănăstire', 'latitudine': 45.1433, 'longitudine': 24.6708,
                'programVizitare': 'Zilnic: 08:00-18:00', 'tarif': 0,
                'curiozitate': 'Ce mănăstire din Argeș, ctitorie a lui Neagoe Basarab, este locul de veci al regilor României?',
            },
            {
                'nume': 'Mănăstirea Humor',
                'descriere': 'Mănăstire din Bucovina cu fresce exterioare remarcabile, înscrisă în patrimoniul UNESCO.',
                'tip': 'mănăstire', 'latitudine': 47.5631, 'longitudine': 25.8961,
                'programVizitare': 'Zilnic: 09:00-17:00', 'tarif': 8,
                'curiozitate': 'Ce mănăstire din Bucovina este celebră pentru scena Asediul Constantinopolului pictată pe peretele exterior?',
            },
            {
                'nume': 'Mănăstirea Barsana',
                'descriere': 'Mănăstire din lemn din Maramureș, înscrisă în patrimoniul UNESCO, simbol al arhitecturii tradiționale maramureșene.',
                'tip': 'mănăstire', 'latitudine': 47.7300, 'longitudine': 23.9100,
                'programVizitare': 'Zilnic: 08:00-18:00', 'tarif': 5,
                'curiozitate': 'Ce mănăstire din lemn din Maramureș face parte din patrimoniul UNESCO pentru arhitectura sa tradițională?',
            },
            # === NATURĂ SUPLIMENTAR ===
            {
                'nume': 'Delta Dunării',
                'descriere': 'A doua cea mai mare deltă din Europa, rezervație a biosferei UNESCO, paradis al biodiversității cu peste 300 specii de păsări.',
                'tip': 'rezervație naturală', 'latitudine': 45.1667, 'longitudine': 29.6333,
                'programVizitare': 'Non-stop (acces cu barca)', 'tarif': 0,
                'curiozitate': 'Ce deltă din România este a doua ca mărime din Europa și adăpostește peste 300 de specii de păsări?',
            },
            {
                'nume': 'Cascada Bigăr',
                'descriere': 'Cascadă unică în lume - apa cade ca o pânză pe un con de mușchi verde în Cheile Nerei, județul Caraș-Severin.',
                'tip': 'cascadă', 'latitudine': 44.9581, 'longitudine': 21.9467,
                'programVizitare': 'Non-stop', 'tarif': 0,
                'curiozitate': 'Ce cascadă din Caraș-Severin a fost numită cea mai spectaculoasă cascadă din lume de o publicație internațională?',
            },
            {
                'nume': 'Cheile Bicazului',
                'descriere': 'Defileu spectaculos în Carpații Orientali cu pereți verticali de calcar de peste 300m înălțime.',
                'tip': 'defileu', 'latitudine': 46.7908, 'longitudine': 25.8400,
                'programVizitare': 'Non-stop', 'tarif': 0,
                'curiozitate': 'Ce defileu din Neamț impresionează prin pereții verticali de calcar și lacul de acumulare Bicaz?',
            },
            {
                'nume': 'Vulcanii Noroioși',
                'descriere': 'Fenomen geologic rar - vulcani miniaturali care erup noroi și gaze naturale, unici ca amploare în Europa.',
                'tip': 'fenomen geologic', 'latitudine': 45.3494, 'longitudine': 26.7206,
                'programVizitare': 'Zilnic: 08:00-20:00', 'tarif': 5,
                'curiozitate': 'Ce fenomen geologic din Buzău produce erupții de noroi și gaze, fiind unic ca amploare în Europa?',
            },
            {
                'nume': 'Lacul Roșu',
                'descriere': 'Lac de baraj natural format în 1837 prin prăbușirea unui versant, cu trunchiuri de molid ieșind din apă.',
                'tip': 'lac', 'latitudine': 46.7800, 'longitudine': 25.8100,
                'programVizitare': 'Non-stop', 'tarif': 0,
                'curiozitate': 'Ce lac din Harghita s-a format natural prin blocarea unui pârâu și are trunchiurile copacilor ieșind din apă?',
            },
            {
                'nume': 'Parcul Național Retezat',
                'descriere': 'Primul parc național din România (1935), cu peste 80 de lacuri glaciare și vârfuri de peste 2.500m altitudine.',
                'tip': 'parc național', 'latitudine': 45.3833, 'longitudine': 22.9167,
                'programVizitare': 'Non-stop', 'tarif': 0,
                'curiozitate': 'Ce parc național din România, înființat în 1935, are cel mai mare număr de lacuri glaciare din țară?',
            },
            {
                'nume': 'Groapa Ruginoasă',
                'descriere': 'Fenomen de eroziune spectaculos denumit Badlands-ul României, cu forme de teren roșcate spectaculoase din Iași.',
                'tip': 'fenomen geologic', 'latitudine': 46.8547, 'longitudine': 26.3681,
                'programVizitare': 'Non-stop', 'tarif': 0,
                'curiozitate': 'Ce formațiune geologică din Iași este denumită Badlands-ul României datorită eroziunii spectaculoase?',
            },
            # === PEȘTERI SUPLIMENTARE ===
            {
                'nume': 'Peștera Urșilor',
                'descriere': 'Peșteră din Apuseni descoperită în 1975, cu mii de oase de urși de peșteră și formațiuni spectaculoase.',
                'tip': 'peșteră', 'latitudine': 46.5044, 'longitudine': 22.6642,
                'programVizitare': 'Zilnic: 09:00-17:00', 'tarif': 30,
                'curiozitate': 'Ce peșteră din Bihor, descoperită în 1975, adăpostește mii de schelete de urși de peșteră?',
            },
            {
                'nume': 'Salina Praid',
                'descriere': 'Una dintre cele mai mari mine de sare din Europa, cu microclimă benefică pentru afecțiunile respiratorii.',
                'tip': 'salină', 'latitudine': 46.5667, 'longitudine': 25.1333,
                'programVizitare': 'Zilnic: 08:00-20:00', 'tarif': 25,
                'curiozitate': 'Ce salină din Harghita este una dintre cele mai mari din Europa și are un microclim terapeutic natural?',
            },
            # === MUZEE & MONUMENTE ===
            {
                'nume': 'Palatul Parlamentului',
                'descriere': 'A doua cea mai mare clădire administrativă din lume după Pentagon, construită în perioada comunistă.',
                'tip': 'monument', 'latitudine': 44.4275, 'longitudine': 26.0872,
                'programVizitare': 'Zilnic: 10:00-16:00 (cu ghid)', 'tarif': 35,
                'curiozitate': 'Ce clădire din București este a doua ca suprafață din lume, cu 1.100 de camere și 12 etaje?',
            },
            {
                'nume': 'Palatul Brukenthal',
                'descriere': 'Cel mai vechi muzeu public din România (deschis în 1817), cu o colecție impresionantă de artă europeană în Sibiu.',
                'tip': 'muzeu', 'latitudine': 45.7983, 'longitudine': 24.1519,
                'programVizitare': 'Marți-Duminică: 10:00-18:00', 'tarif': 25,
                'curiozitate': 'Ce muzeu din Sibiu, deschis în 1817, este cel mai vechi muzeu public din România?',
            },
            {
                'nume': 'Arcul de Triumf',
                'descriere': 'Simbol al Bucureștiului construit în 1936, dedicat eroilor români din Primul Război Mondial.',
                'tip': 'monument', 'latitudine': 44.4678, 'longitudine': 26.0775,
                'programVizitare': 'Weekend: 10:00-18:00', 'tarif': 0,
                'curiozitate': 'Ce monument de pe Calea Victoriei din București a fost construit în 1936 pentru a celebra victoriile din Primul Război Mondial?',
            },
            {
                'nume': 'Cimitirul Vesel din Săpânța',
                'descriere': 'Cimitir unic în lume cu cruci colorate și epitafuri pline de umor despre viața celor decedați.',
                'tip': 'monument', 'latitudine': 47.9667, 'longitudine': 23.7000,
                'programVizitare': 'Zilnic: 09:00-18:00', 'tarif': 5,
                'curiozitate': 'Ce cimitir din Maramureș este unic în lume prin crucile sale colorate cu versuri hazlii despre viața defuncților?',
            },
            # === ORAȘE & PIEȚE ISTORICE ===
            {
                'nume': 'Piața Mare Sibiu',
                'descriere': 'Piața centrală a Sibiului, înconjurată de clădiri baroce și gotice, inima orașului medieval.',
                'tip': 'piață istorică', 'latitudine': 45.7983, 'longitudine': 24.1525,
                'programVizitare': 'Non-stop', 'tarif': 0,
                'curiozitate': 'Ce piață medievală din Sibiu este înconjurată de palate baroce și a găzduit execuții publice în Evul Mediu?',
            },
            {
                'nume': 'Strada Sforii',
                'descriere': 'Una dintre cele mai înguste străzi din Europa (111cm lățime), situată în centrul istoric al Brașovului.',
                'tip': 'atracție urbană', 'latitudine': 45.6431, 'longitudine': 25.5895,
                'programVizitare': 'Non-stop', 'tarif': 0,
                'curiozitate': 'Ce stradă din Brașov, cu lățimea de doar 111 cm, este una dintre cele mai înguste din Europa?',
            },
            # === STAȚIUNI ===
            {
                'nume': 'Mamaia',
                'descriere': 'Cea mai mare stațiune de pe litoralul Mării Negre, cu plaje fine de nisip și o bogată viață de noapte.',
                'tip': 'stațiune', 'latitudine': 44.2500, 'longitudine': 28.6333,
                'programVizitare': 'Sezon estival: mai-septembrie', 'tarif': 0,
                'curiozitate': 'Ce stațiune de pe litoralul Mării Negre este cea mai mare din România și cea mai populară destinație de vară?',
            },
            {
                'nume': 'Băile Herculane',
                'descriere': 'Una dintre cele mai vechi stațiuni balneare din Europa, cu ape termale folosite încă din antichitate de romani.',
                'tip': 'stațiune', 'latitudine': 44.8667, 'longitudine': 22.4167,
                'programVizitare': 'Non-stop', 'tarif': 0,
                'curiozitate': 'Ce stațiune din Caraș-Severin era frecventată de împăratul Franz Josef și are ape termale cunoscute din Antichitate?',
            },
            {
                'nume': 'Poiana Brașov',
                'descriere': 'Cea mai importantă stațiune de schi din România, situată la 1.030m altitudine, cu pârtii pentru toate nivelele.',
                'tip': 'stațiune', 'latitudine': 45.5933, 'longitudine': 25.5567,
                'programVizitare': 'Non-stop (sezon ski: dec-martie)', 'tarif': 0,
                'curiozitate': 'Ce stațiune montană de lângă Brașov este cea mai populară destinație de schi din România?',
            },
        ]

        count = 0
        for data in atractii:
            obj, created = AtractieTuristica.objects.get_or_create(
                nume=data['nume'],
                defaults=data
            )
            if created:
                count += 1
        self.stdout.write(f'  Atracții turistice: {count} adăugate')

    def _seed_preparate(self):
        preparate = [
            # Transilvania
            {'nume': 'Ciorbă de burtă', 'regiune': 'Transilvania'},
            {'nume': 'Varză à la Cluj', 'regiune': 'Transilvania'},
            {'nume': 'Kürtőskalács (Cozonac secuiesc)', 'regiune': 'Transilvania'},
            {'nume': 'Balmoș', 'regiune': 'Transilvania'},
            {'nume': 'Papanași ardelenești', 'regiune': 'Transilvania'},
            # Moldova
            {'nume': 'Ciorbă de perișoare', 'regiune': 'Moldova'},
            {'nume': 'Tochitură moldovenească', 'regiune': 'Moldova'},
            {'nume': 'Plăcintă cu brânză', 'regiune': 'Moldova'},
            {'nume': 'Alivenci', 'regiune': 'Moldova'},
            # Muntenia / Oltenia
            {'nume': 'Sarmale', 'regiune': 'Muntenia'},
            {'nume': 'Pomana porcului', 'regiune': 'Oltenia'},
            {'nume': 'Ciorbă de fasole cu ciolan afumat', 'regiune': 'Oltenia'},
            {'nume': 'Mici (Mititei)', 'regiune': 'Muntenia'},
            # Maramureș
            {'nume': 'Tocană de cartofi', 'regiune': 'Maramureș'},
            {'nume': 'Cârnaț afumat de Maramureș', 'regiune': 'Maramureș'},
            {'nume': 'Struț de Maramureș', 'regiune': 'Maramureș'},
            # Dobrogea
            {'nume': 'Saramură de crap', 'regiune': 'Dobrogea'},
            {'nume': 'Plachie de pește', 'regiune': 'Dobrogea'},
            # Banat
            {'nume': 'Rață pe varză', 'regiune': 'Banat'},
            {'nume': 'Gomboți cu prune', 'regiune': 'Banat'},
        ]

        count = 0
        for data in preparate:
            obj, created = PreparatLocal.objects.get_or_create(
                nume=data['nume'],
                defaults=data
            )
            if created:
                count += 1
        self.stdout.write(f'  Preparate locale: {count} adăugate')

    def _seed_festivaluri(self):
        from datetime import date

        festivaluri = [
            {'nume': 'Festivalul Medieval Sighișoara', 'dataStart': date(2026, 7, 24), 'dataEnd': date(2026, 7, 26)},
            {'nume': 'Untold Festival', 'dataStart': date(2026, 8, 6), 'dataEnd': date(2026, 8, 9)},
            {'nume': 'Electric Castle', 'dataStart': date(2026, 7, 15), 'dataEnd': date(2026, 7, 19)},
            {'nume': 'Festivalul Ouălor Încondeiate – Ciocănești', 'dataStart': date(2026, 4, 10), 'dataEnd': date(2026, 4, 12)},
            {'nume': 'Festivalul Internațional de Teatru Sibiu (FITS)', 'dataStart': date(2026, 6, 12), 'dataEnd': date(2026, 6, 21)},
            {'nume': 'Neversea', 'dataStart': date(2026, 7, 2), 'dataEnd': date(2026, 7, 5)},
            {'nume': 'Festivalul Medieval Brașov – Junii Brașovului', 'dataStart': date(2026, 5, 1), 'dataEnd': date(2026, 5, 3)},
            {'nume': 'Sambra Oilor – Bran', 'dataStart': date(2026, 4, 20), 'dataEnd': date(2026, 4, 20)},
            {'nume': 'Hora de la Prislop', 'dataStart': date(2026, 8, 15), 'dataEnd': date(2026, 8, 15)},
            {'nume': 'Festivalul Sarmale Satu Mare', 'dataStart': date(2026, 9, 5), 'dataEnd': date(2026, 9, 7)},
        ]

        count = 0
        for data in festivaluri:
            obj, created = Festival.objects.get_or_create(
                nume=data['nume'],
                defaults=data
            )
            if created:
                count += 1
        self.stdout.write(f'  Festivaluri: {count} adăugate')

    def _seed_badge_uri(self):
        badge_uri = [
            {
                'nume': 'Prima descoperire',
                'descriere': 'Ai descoperit prima ta atracție turistică!',
                'criteriu': 'total_descoperiri >= 1',
                'iconUrl': '🎖️',
            },
            {
                'nume': 'Explorator',
                'descriere': 'Ai descoperit 5 atracții turistice',
                'criteriu': 'total_descoperiri >= 5',
                'iconUrl': '🚀',
            },
            {
                'nume': 'Exploratorul Carpaților',
                'descriere': 'Ai descoperit 5 atracții montane sau peșteri',
                'criteriu': 'descoperiri_munte_pestera >= 5',
                'iconUrl': '🏔️',
            },
            {
                'nume': 'Iubitorul de Castele',
                'descriere': 'Ai descoperit 3 castele sau cetăți',
                'criteriu': 'descoperiri_castel_cetate >= 3',
                'iconUrl': '🏰',
            },
            {
                'nume': 'Pelerin Credincios',
                'descriere': 'Ai descoperit 5 biserici sau mănăstiri',
                'criteriu': 'descoperiri_biserica >= 5',
                'iconUrl': '⛪',
            },
            {
                'nume': 'Explorator Local',
                'descriere': 'Ai descoperit 10 atracții turistice',
                'criteriu': 'total_descoperiri >= 10',
                'iconUrl': '🗺️',
            },
            {
                'nume': 'Aventurier',
                'descriere': 'Ai descoperit 25 de atracții turistice',
                'criteriu': 'total_descoperiri >= 25',
                'iconUrl': '🧭',
            },
            {
                'nume': 'Maestru al României',
                'descriere': 'Ai descoperit 50 de atracții turistice',
                'criteriu': 'total_descoperiri >= 50',
                'iconUrl': '👑',
            },
            {
                'nume': 'Primul Traseu',
                'descriere': 'Ai completat primul tău traseu',
                'criteriu': 'trasee_completate >= 1',
                'iconUrl': '🚗',
            },
            {
                'nume': 'Călător Experimentat',
                'descriere': 'Ai completat 5 trasee',
                'criteriu': 'trasee_completate >= 5',
                'iconUrl': '✈️',
            },
        ]

        count = 0
        for data in badge_uri:
            obj, created = Badge.objects.get_or_create(
                nume=data['nume'],
                defaults=data
            )
            if created:
                count += 1
        self.stdout.write(f'  Badge-uri: {count} adăugate')

    def _seed_trasee_prestabilite(self):
        trasee = [
            {
                'punctStart': 'Brașov',
                'punctSosire': 'Sibiu',
                'distantaKm': 170,
                'durataMin': 180,
                'tip': 'cultural',
                'atractii_nume': ['Castelul Bran', 'Castelul Peleș', 'Biserica Neagră', 'Muzeul ASTRA'],
            },
            {
                'punctStart': 'Cluj-Napoca',
                'punctSosire': 'Alba Iulia',
                'distantaKm': 110,
                'durataMin': 100,
                'tip': 'istoric',
                'atractii_nume': ['Salina Turda', 'Cetatea Alba Carolina'],
            },
            {
                'punctStart': 'Suceava',
                'punctSosire': 'Gura Humorului',
                'distantaKm': 50,
                'durataMin': 55,
                'tip': 'religios',
                'atractii_nume': ['Mănăstirea Voroneț', 'Mănăstirea Sucevița'],
            },
            {
                'punctStart': 'Hunedoara',
                'punctSosire': 'Petroșani',
                'distantaKm': 70,
                'durataMin': 80,
                'tip': 'aventură',
                'atractii_nume': ['Castelul Corvinilor', 'Peștera Muierilor'],
            },
            {
                'punctStart': 'Brașov',
                'punctSosire': 'Curtea de Argeș',
                'distantaKm': 200,
                'durataMin': 240,
                'tip': 'natură',
                'atractii_nume': ['Sfinxul Bucegilor', 'Transfăgărășanul'],
            },
        ]

        count = 0
        for data in trasee:
            atractii_nume = data.pop('atractii_nume')

            if Traseu.objects.filter(
                punctStart=data['punctStart'],
                punctSosire=data['punctSosire'],
                estePrestabilit=True
            ).exists():
                continue

            traseu = Traseu.objects.create(
                estePrestabilit=True,
                utilizator=None,
                **data
            )

            for i, nume in enumerate(atractii_nume):
                atractie = AtractieTuristica.objects.filter(nume=nume).first()
                if atractie:
                    PunctTraseu.objects.create(
                        traseu=traseu,
                        atractie=atractie,
                        ordine=i + 1
                    )
            
            count += 1
        
        self.stdout.write(f'  Trasee prestabilite: {count} adăugate')
