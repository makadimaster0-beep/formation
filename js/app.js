const sb=supabase.createClient(SB_URL,SB_KEY);
const LN=['Français','English','Nederlands','العربية'],LC=['fr','en','nl','ar'];
let LI=(()=>{try{const s=localStorage.getItem('lp-lang');if(s!==null)return +s}catch(e){}const i=LC.indexOf((navigator.language||'fr').slice(0,2));return i<0?0:i})();
// Traductions : clé:'français|English|Nederlands|العربية'
const T={
tagline:'Cours en ligne d’anglais et de français.|Online English and French courses.|Online cursussen Engels en Frans.|دورات عبر الإنترنت في الإنجليزية والفرنسية.',
login:'Connexion|Log in|Inloggen|تسجيل الدخول',signup:'Créer un compte|Create an account|Account aanmaken|إنشاء حساب',
signupBtn:'Créer mon compte élève|Create my student account|Mijn leerlingaccount maken|إنشاء حساب طالب',haveAcc:'J’ai déjà un compte|I already have an account|Ik heb al een account|لدي حساب بالفعل',
name:'Nom complet|Full name|Volledige naam|الاسم الكامل',email:'E-mail|Email|E-mail|البريد الإلكتروني',pw:'Mot de passe|Password|Wachtwoord|كلمة المرور',
forgot:'Mot de passe oublié ?|Forgot password?|Wachtwoord vergeten?|نسيت كلمة المرور؟',sendReset:'Envoyer le lien|Send reset link|Link versturen|إرسال الرابط',
bad:'Identifiants incorrects.|Incorrect credentials.|Onjuiste inloggegevens.|بيانات الدخول غير صحيحة.',
needAll:'Nom, e-mail et mot de passe (6 caractères min.) obligatoires.|Name, email and password (min. 6 characters) are required.|Naam, e-mail en wachtwoord (min. 6 tekens) zijn verplicht.|الاسم والبريد وكلمة المرور (6 أحرف على الأقل) مطلوبة.',
created:'Compte créé ! Confirmez votre e-mail si demandé, puis connectez-vous.|Account created! Confirm your email if asked, then log in.|Account aangemaakt! Bevestig je e-mail indien gevraagd en log in.|تم إنشاء الحساب! أكّد بريدك إن طُلب منك ثم سجّل الدخول.',
resetSent:'E-mail de réinitialisation envoyé. Vérifiez votre boîte de réception.|Reset email sent. Check your inbox.|Reset-e-mail verzonden. Controleer je inbox.|تم إرسال رسالة إعادة التعيين. تحقق من بريدك.',
enterEmail:'Saisissez d’abord votre e-mail.|Enter your email first.|Vul eerst je e-mail in.|أدخل بريدك الإلكتروني أولاً.',
newPw:'Nouveau mot de passe|New password|Nieuw wachtwoord|كلمة مرور جديدة',confPw:'Confirmer le mot de passe|Confirm password|Bevestig wachtwoord|تأكيد كلمة المرور',
save:'Enregistrer|Save|Opslaan|حفظ',pwBad:'Les mots de passe ne correspondent pas ou sont trop courts (6 min.).|Passwords do not match or are too short (min. 6).|Wachtwoorden komen niet overeen of zijn te kort (min. 6).|كلمتا المرور غير متطابقتين أو قصيرتان (6 على الأقل).',
pwOk:'Mot de passe modifié.|Password updated.|Wachtwoord gewijzigd.|تم تغيير كلمة المرور.',resetTitle:'Réinitialiser le mot de passe|Reset password|Wachtwoord herstellen|إعادة تعيين كلمة المرور',
r_admin:'Administrateur|Administrator|Beheerder|مدير',r_prof:'Professeur|Teacher|Docent|معلم',r_eleve:'Élève|Student|Leerling|طالب',
t_home:'Accueil|Home|Home|الرئيسية',t_dash:'Tableau de bord|Dashboard|Dashboard|لوحة التحكم',t_users:'Utilisateurs|Users|Gebruikers|المستخدمون',t_courses:'Cours|Courses|Cursussen|الدورات',
t_mine:'Mes cours|My courses|Mijn cursussen|دوراتي',t_cat:'Catalogue|Catalogue|Catalogus|الكتالوج',t_notif:'Notifications|Notifications|Meldingen|الإشعارات',t_settings:'Paramètres|Settings|Instellingen|الإعدادات',
logout:'Déconnexion|Log out|Uitloggen|خروج',students:'Élèves|Students|Leerlingen|الطلاب',teachers:'Professeurs|Teachers|Docenten|المعلمون',enrolments:'Inscriptions|Enrolments|Inschrijvingen|التسجيلات',
usersHelp:'Les personnes créent leur compte elles-mêmes (élève par défaut). Changez ici leur rôle.|People create their own account (student by default). Change their role here.|Gebruikers maken zelf een account (standaard leerling). Wijzig hier hun rol.|ينشئ الأشخاص حساباتهم بأنفسهم (طالب افتراضياً). غيّر دورهم هنا.',
newCourse:'Nouveau cours|New course|Nieuwe cursus|دورة جديدة',title:'Titre|Title|Titel|العنوان',langTaught:'Langue enseignée|Language taught|Taal van de cursus|لغة الدورة',
en:'Anglais|English|Engels|الإنجليزية',fr:'Français|French|Frans|الفرنسية',level:'Niveau|Level|Niveau|المستوى',desc:'Description|Description|Beschrijving|الوصف',
create:'Créer le cours|Create course|Cursus maken|إنشاء الدورة',noCourse:'Aucun cours.|No courses.|Geen cursussen.|لا توجد دورات.',teacher:'Prof|Teacher|Docent|المعلم',
lessonsN:'leçon(s)|lesson(s)|les(sen)|درس',open:'Ouvrir|Open|Openen|فتح',del:'Supprimer|Delete|Verwijderen|حذف',enroll:'S’inscrire|Enrol|Inschrijven|التسجيل',
back:'← Retour|← Back|← Terug|→ رجوع',progress:'Progression|Progress|Voortgang|التقدم',lessons:'Leçons|Lessons|Lessen|الدروس',noLesson:'Aucune leçon pour le moment.|No lessons yet.|Nog geen lessen.|لا توجد دروس بعد.',
quiz:'Quiz|Quiz|Quiz|اختبار',choices:'Choix|Choices|Opties|الخيارات',answer:'réponse|answer|antwoord|الإجابة',right:'✔ Bonne réponse !|✔ Correct!|✔ Goed zo!|✔ إجابة صحيحة!',wrong:'✘ Essayez encore.|✘ Try again.|✘ Probeer opnieuw.|✘ حاول مرة أخرى.',
markDone:'Marquer comme terminé|Mark as done|Markeer als voltooid|وضع علامة منجز',addLesson:'Ajouter une leçon|Add a lesson|Les toevoegen|إضافة درس',content:'Contenu|Content|Inhoud|المحتوى',
quizQ:'Question de quiz (facultatif)|Quiz question (optional)|Quizvraag (optioneel)|سؤال الاختبار (اختياري)',optsLbl:'Options séparées par des virgules|Options separated by commas|Opties gescheiden door komma’s|الخيارات مفصولة بفواصل',
goodN:'Numéro de la bonne option|Number of the correct option|Nummer van het juiste antwoord|رقم الخيار الصحيح',addLessonBtn:'Ajouter la leçon|Add lesson|Les toevoegen|إضافة الدرس',
books:'Livres et ressources|Books and resources|Boeken en bronnen|الكتب والمصادر',noBook:'Aucun livre pour le moment.|No books yet.|Nog geen boeken.|لا توجد كتب بعد.',addBook:'Ajouter un livre|Add a book|Boek toevoegen|إضافة كتاب',
author:'Auteur|Author|Auteur|المؤلف',linkOpt:'Lien (facultatif)|Link (optional)|Link (optioneel)|رابط (اختياري)',read:'Lire|Read|Lezen|قراءة',addBookBtn:'Ajouter le livre|Add book|Boek toevoegen|إضافة الكتاب',
urlErr:'Le lien doit commencer par http:// ou https://|The link must start with http:// or https://|De link moet beginnen met http:// of https://|يجب أن يبدأ الرابط بـ http:// أو https://',
liveNow:'🔴 Cours en direct en cours|🔴 Live class in progress|🔴 Live les bezig|🔴 درس مباشر جارٍ',join:'Rejoindre le cours|Join the class|Deelnemen aan de les|الانضمام إلى الدرس',
noLink:'Le professeur est en ligne (aucun lien fourni).|The teacher is online (no link provided).|De docent is online (geen link).|المعلم متصل (لا يوجد رابط).',endLive:'Terminer le direct|End live class|Live beëindigen|إنهاء البث',
replayLbl:'Lien de la rediffusion (facultatif)|Replay link (optional)|Link naar herhaling (optioneel)|رابط الإعادة (اختياري)',liveTitle:'Cours en direct|Live class|Live les|درس مباشر',
visioLbl:'Lien de visioconférence (facultatif)|Video call link (optional)|Link videogesprek (optioneel)|رابط المكالمة (اختياري)',
startLive:'🔴 Lancer le cours et notifier les élèves|🔴 Start class and notify students|🔴 Start de les en breng leerlingen op de hoogte|🔴 بدء الدرس وإشعار الطلاب',
notifyN:'{n} élève(s) inscrit(s) seront notifiés.|{n} enrolled student(s) will be notified.|{n} ingeschreven leerling(en) worden gemeld.|سيتم إشعار {n} طالب مسجّل.',badgeLive:'🔴 En direct|🔴 Live|🔴 Live|🔴 مباشر',
replays:'Rediffusions des cours en direct|Live class replays|Herhalingen van live lessen|إعادات الدروس المباشرة',replay:'Revoir le cours|Watch replay|Herhaling bekijken|مشاهدة الإعادة',
noReplay:'Rediffusion bientôt disponible|Replay coming soon|Herhaling volgt|الإعادة قريباً',setReplay:'Lien de rediffusion|Set replay link|Herhalingslink instellen|ضبط رابط الإعادة',
missed:'Cours manqué ? Retrouvez-le ici.|Missed a class? Find it here.|Les gemist? Vind hem hier.|فاتك درس؟ ستجده هنا.',noSessions:'Aucun cours en direct terminé pour le moment.|No finished live classes yet.|Nog geen afgeronde live lessen.|لا توجد دروس مباشرة منتهية بعد.',
markAll:'Tout marquer comme lu|Mark all as read|Alles als gelezen markeren|تعليم الكل كمقروء',noNotif:'Aucune notification.|No notifications.|Geen meldingen.|لا توجد إشعارات.',
unreadN:'{n} notification(s) non lue(s)|{n} unread notification(s)|{n} ongelezen melding(en)|{n} إشعار غير مقروء',liveMsg:'🔴 Le cours « {c} » vient de démarrer en direct !|🔴 The class “{c}” has just started live!|🔴 De les “{c}” is live gestart!|🔴 بدأ الدرس «{c}» مباشرة!',
profile:'Mon profil|My profile|Mijn profiel|ملفي الشخصي',changePw:'Changer le mot de passe|Change password|Wachtwoord wijzigen|تغيير كلمة المرور',langLbl:'Langue de l’application|App language|Taal van de app|لغة التطبيق',
saved:'Enregistré.|Saved.|Opgeslagen.|تم الحفظ.',langNote:'Le contenu des cours (écrit par les professeurs) n’est pas traduit.|Course content (written by teachers) is not translated.|Cursusinhoud (door docenten geschreven) wordt niet vertaald.|محتوى الدورات (من كتابة المعلمين) لا يُترجم.',
heroT:'Apprenez l’anglais et le français en ligne|Learn English and French online|Leer Engels en Frans online|تعلّم الإنجليزية والفرنسية عبر الإنترنت',
heroS:'Des cours animés par des professeurs, en direct ou à votre rythme.|Courses led by teachers, live or at your own pace.|Cursussen van docenten, live of in je eigen tempo.|دورات يقدمها معلمون، مباشرة أو وفق وتيرتك.',
f1T:'Cours en direct|Live classes|Live lessen|دروس مباشرة',f1:'Rejoignez votre professeur en visio et retrouvez les rediffusions des cours manqués.|Join your teacher by video and find replays of missed classes.|Neem deel via video en bekijk herhalingen van gemiste lessen.|انضم إلى معلمك عبر الفيديو وشاهد إعادة الدروس الفائتة.',
f2T:'Quiz et progression|Quizzes and progress|Quizzen en voortgang|اختبارات وتقدم',f2:'Testez-vous après chaque leçon et suivez vos progrès.|Test yourself after each lesson and track your progress.|Test jezelf na elke les en volg je voortgang.|اختبر نفسك بعد كل درس وتابع تقدمك.',
f3T:'Livres et ressources|Books and resources|Boeken en bronnen|كتب ومصادر',f3:'Des livres et ressources choisis par vos professeurs.|Books and resources chosen by your teachers.|Boeken en bronnen gekozen door je docenten.|كتب ومصادر يختارها معلموك.',
levelsT:'Tous les niveaux, de A1 à C1|All levels, from A1 to C1|Alle niveaus, van A1 tot C1|جميع المستويات من A1 إلى C1',ourForm:'Nos formations|Our courses|Onze cursussen|دوراتنا',howT:'Comment ça marche ?|How does it work?|Hoe werkt het?|كيف يعمل؟',
s1:'1. Créez votre compte gratuit|1. Create your free account|1. Maak je gratis account|1. أنشئ حسابك المجاني',s2:'2. Choisissez votre formation (paiement sécurisé si payante)|2. Choose your course (secure payment if paid)|2. Kies je cursus (veilig betalen indien betaald)|2. اختر دورتك (دفع آمن إن كانت مدفوعة)',
s3:'3. Recevez la notification et suivez le cours|3. Get the notification and follow the class|3. Ontvang de melding en volg de les|3. استلم الإشعار وتابع الدرس',welcome:'Bienvenue|Welcome|Welkom|مرحباً',
dbErr:'Erreur base : |Database error: |Databasefout: |خطأ في قاعدة البيانات: ',noProfile:'Profil introuvable. Avez-vous exécuté supabase/schema.sql ?|Profile not found. Did you run supabase/schema.sql?|Profiel niet gevonden. Heb je supabase/schema.sql uitgevoerd?|الملف الشخصي غير موجود. هل نفّذت supabase/schema.sql؟',
price:'Prix (€, 0 = gratuit)|Price (€, 0 = free)|Prijs (€, 0 = gratis)|السعر (€، 0 = مجاني)',liveAt:'Date et heure du cours|Class date and time|Datum en tijd van de les|تاريخ ووقت الدرس',free:'Gratuit|Free|Gratis|مجاني',
payEnroll:'Payer {p} et s’inscrire|Pay {p} and enrol|Betaal {p} en schrijf je in|ادفع {p} وسجّل',payRedirect:'Redirection vers le paiement…|Redirecting to payment…|Doorsturen naar betaling…|جارٍ التحويل إلى الدفع…',
payErr:'Paiement indisponible pour le moment.|Payment unavailable right now.|Betalen is momenteel niet mogelijk.|الدفع غير متاح حالياً.',unlocked:'✅ Accès débloqué : {c}|✅ Access unlocked: {c}|✅ Toegang geactiveerd: {c}|✅ تم فتح الوصول: {c}',
locked:'Contenu réservé aux élèves inscrits.|Content reserved for enrolled students.|Inhoud alleen voor ingeschreven leerlingen.|المحتوى مخصص للطلاب المسجلين.',t_pay:'Paiements|Payments|Betalingen|المدفوعات',paid:'Payé|Paid|Betaald|مدفوع',
unlock:'Débloquer manuellement|Unlock manually|Handmatig activeren|فتح يدوياً',unlockHelp:'Débloquez un élève (ex. virement bancaire).|Unlock a student (e.g. bank transfer).|Activeer een leerling (bijv. bankoverschrijving).|افتح الوصول لطالب (مثلاً تحويل بنكي).',
noPay:'Aucun paiement.|No payments.|Geen betalingen.|لا توجد مدفوعات.',schedule:'Planification et prix|Schedule and price|Planning en prijs|الجدولة والسعر',upcoming:'Prochains cours|Upcoming classes|Komende lessen|الدروس القادمة',
heroCta:'Voir les formations|See courses|Bekijk cursussen|عرض الدورات',secureT:'Paiement sécurisé|Secure payment|Veilig betalen|دفع آمن',
secure:'Payez en ligne : l’accès au cours et les notifications sont activés automatiquement.|Pay online: course access and notifications are activated automatically.|Betaal online: toegang en meldingen worden automatisch geactiveerd.|ادفع عبر الإنترنت: يتم تفعيل الوصول والإشعارات تلقائياً.',
lvlLbl:'Votre niveau|Your level|Je niveau|مستواك',lv_A1:'A1 — Débutant|A1 — Beginner|A1 — Beginner|A1 — مبتدئ',lv_A2:'A2 — Élémentaire|A2 — Elementary|A2 — Elementair|A2 — أساسي',lv_B1:'B1 — Intermédiaire|B1 — Intermediate|B1 — Gemiddeld|B1 — متوسط',
lv_B2:'B2 — Intermédiaire avancé|B2 — Upper-intermediate|B2 — Hoger gemiddeld|B2 — فوق المتوسط',lv_C1:'C1 — Avancé|C1 — Advanced|C1 — Gevorderd|C1 — متقدم',allLevels:'Tous les niveaux|All levels|Alle niveaus|كل المستويات',
t_students:'Élèves inscrits|Registered students|Ingeschreven leerlingen|الطلاب المسجلون',noStudents:'Aucun élève pour le moment.|No students yet.|Nog geen leerlingen.|لا يوجد طلاب بعد.',
lowMsg:'⚠️ Nouvel élève de niveau bas : {n} ({l}). Prévoyez un accompagnement.|⚠️ New low-level student: {n} ({l}). Plan extra support.|⚠️ Nieuwe leerling met laag niveau: {n} ({l}). Plan extra begeleiding.|⚠️ طالب جديد بمستوى منخفض: {n} ({l}). يُنصح بدعم إضافي.',
gapMsg:'⚠️ {n} (niveau {s}) s’est inscrit à « {c} » (niveau {l}) : niveau inférieur au cours.|⚠️ {n} (level {s}) enrolled in “{c}” (level {l}): below the course level.|⚠️ {n} (niveau {s}) schreef zich in voor “{c}” (niveau {l}): lager dan het niveau van de cursus.|⚠️ {n} (مستوى {s}) سجّل في «{c}» (مستوى {l}): أقل من مستوى الدورة.',
newTeacher:'Créer un professeur|Create a teacher|Docent aanmaken|إنشاء معلم',teacherHelp:'Seul l’administrateur peut créer un compte professeur.|Only the administrator can create a teacher account.|Alleen de beheerder kan een docentaccount maken.|المدير فقط يمكنه إنشاء حساب معلم.',
createTeacher:'Créer le compte professeur|Create teacher account|Docentaccount maken|إنشاء حساب المعلم',teacherOk:'Professeur créé.|Teacher created.|Docent aangemaakt.|تم إنشاء المعلم.',
currency:'Devise|Currency|Valuta|العملة',cur_eur:'Euro|Euro|Euro|يورو',cur_usd:'Dollar US|US dollar|Amerikaanse dollar|دولار أمريكي',cur_zar:'Rand sud-africain|South African rand|Zuid-Afrikaanse rand|راند جنوب أفريقي',
cur_aed:'Dirham (arabe)|Dirham (Arab)|Dirham (Arabisch)|درهم إماراتي',cur_sar:'Riyal saoudien (arabe)|Saudi riyal (Arab)|Saoedische riyal (Arabisch)|ريال سعودي',
beforePub:'Aperçu du prix dans toutes les devises (avant publication)|Price preview in all currencies (before publishing)|Prijsvoorbeeld in alle valuta (vóór publicatie)|معاينة السعر بكل العملات (قبل النشر)',
chosen:'choisie|selected|gekozen|المختارة',rateNote:'Équivalents indicatifs ; le paiement se fait dans la devise choisie.|Indicative equivalents; payment is made in the selected currency.|Indicatieve equivalenten; betaling gebeurt in de gekozen valuta.|مبالغ تقريبية؛ يتم الدفع بالعملة المختارة.',
capLbl:'Limite d’élèves (vide = illimité)|Student limit (empty = unlimited)|Limiet aantal leerlingen (leeg = onbeperkt)|حد الطلاب (فارغ = بلا حد)',capInfo:'Limité à {n} élèves|Limited to {n} students|Beperkt tot {n} leerlingen|محدود بـ {n} طالباً',
liveFull:'Le cours est complet.|The class is full.|De les is vol.|الدرس مكتمل العدد.',kickedMsg:'Vous avez été retiré de ce cours en direct.|You have been removed from this live class.|Je bent uit deze live les verwijderd.|تمت إزالتك من هذا الدرس المباشر.',
liveOver:'Le cours en direct n’est pas disponible.|The live class is not available.|De live les is niet beschikbaar.|الدرس المباشر غير متاح.',inLive:'Élèves présents|Students present|Aanwezige leerlingen|الطلاب الحاضرون',
kick:'Retirer|Remove|Verwijderen|إزالة',kickedL:'Retirés|Removed|Verwijderd|المُزالون',readmit:'Réadmettre|Readmit|Opnieuw toelaten|إعادة قبول',
openLink:'Ouvrir le lien du cours|Open class link|Open de lessenlink|فتح رابط الدرس',leaveLive:'Quitter le live|Leave live class|Live les verlaten|مغادرة البث',
kickMsg:'⛔ Vous avez été retiré du cours en direct « {c} ».|⛔ You were removed from the live class “{c}”.|⛔ Je bent verwijderd uit de live les “{c}”.|⛔ تمت إزالتك من الدرس المباشر «{c}».',
teacherOnly:'Visible uniquement par le professeur|Visible to the teacher only|Alleen zichtbaar voor de docent|مرئي للمعلم فقط',
zoomNote:'Pensez aussi à exclure l’élève dans votre outil de visio.|Also remove the student in your video-call tool.|Verwijder de leerling ook in je videogesprek-tool.|تذكّر أيضاً إزالة الطالب في أداة الفيديو.',
loading:'Chargement…|Loading…|Laden…|جارٍ التحميل…'};
const t=(k,o)=>{let s=((T[k]||k).split('|')[LI])||'';if(o)for(const x in o)s=s.replace('{'+x+'}',o[x]);return s};
const applyLang=()=>{document.documentElement.lang=LC[LI];document.documentElement.dir=LI===3?'rtl':'ltr'};
function setLang(i){LI=+i;try{localStorage.setItem('lp-lang',LI)}catch(e){}applyLang();render()}
const langSelect=()=>`<select style="width:auto;margin:0" onchange="setLang(this.value)">${LN.map((n,i)=>`<option value="${i}"${i===LI?' selected':''}>${n}</option>`).join('')}</select>`;

let UID=null,me=null,ch=null,D={profiles:[],courses:[],enr:[],prog:[],notifs:[],sess:[],pub:[],pay:[],parts:[],links:[]};
const S={tab:null,course:null,lesson:null,mode:'home',err:'',ok:'',res:'',recovery:false,jl:{}};
const LV=['A1','A2','B1','B2','C1'];
const TABS={admin:['home','dash','users','students','courses','pay','notif','settings'],prof:['home','mine','students','notif','settings'],eleve:['home','cat','my','notif','settings']};
const v=i=>document.getElementById(i).value;
const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const okUrl=s=>!s||/^https?:\/\//i.test(s);
const cc=id=>D.courses.find(c=>c.id===id);
const enrolled=id=>D.enr.some(e=>e.course_id===id&&e.user_id===UID);
const done=id=>D.prog.some(p=>p.lesson_id===id&&p.user_id===UID);
const nCount=()=>D.notifs.filter(n=>!n.read).length;
const pct=c=>c.lessons.length?Math.round(100*c.lessons.filter(l=>done(l.id)).length/c.lessons.length):0;
const canEdit=c=>me.role==='admin'||(me.role==='prof'&&c.teacher===UID);
const vis=c=>me.role!=='eleve'||enrolled(c.id);
const nm=n=>{const m=n.msg,a=m.split('|');return m.startsWith('LIVE|')?t('liveMsg',{c:m.slice(5)}):m.startsWith('PAID|')?t('unlocked',{c:m.slice(5)}):m.startsWith('LOW|')?t('lowMsg',{n:a[1],l:a[2]}):m.startsWith('GAP|')?t('gapMsg',{n:a[1],c:a[2],s:a[3],l:a[4]}):m.startsWith('KICK|')?t('kickMsg',{c:m.slice(5)}):m};
const dt=s=>new Date(s).toLocaleString(LC[LI]);
function toast(m){const d=document.createElement('div');d.className='toast';d.textContent=m;document.body.appendChild(d);setTimeout(()=>d.remove(),4000)}

async function loadPub(){const r=await sb.from('courses').select('id,title,lang,level,descr,live,price,currency,live_at').order('created_at');D.pub=r.data||[]}
async function loadAll(){
 const [p,c,e,g,n,s,y,z,k]=await Promise.all([sb.from('profiles').select('*').order('name'),sb.from('courses').select('*,lessons(*),books(*)').order('created_at'),
  sb.from('enrollments').select('*'),sb.from('progress').select('*'),sb.from('notifications').select('*').order('created_at',{ascending:false}),sb.from('sessions').select('*').order('started_at',{ascending:false}),sb.from('payments').select('*').order('created_at',{ascending:false}),sb.from('live_participants').select('*'),sb.from('live_links').select('*')]);
 const er=[p,c,e,g,n,s,y,z,k].find(r=>r.error);S.err=er?t('dbErr')+er.error.message:'';
 D={...D,profiles:p.data||[],courses:(c.data||[]).map(x=>({...x,lessons:(x.lessons||[]).sort((a,b)=>a.created_at<b.created_at?-1:1),books:x.books||[]})),enr:e.data||[],prog:g.data||[],notifs:n.data||[],sess:s.data||[],pay:y.data||[],parts:z.data||[],links:k.data||[]};
 me=D.profiles.find(x=>x.id===UID)||null}
async function run(p){const r=await p;if(r.error)alert(r.error.message);await loadAll();render()}
async function refresh(){if(!UID)return;await loadAll();const a=document.activeElement;if(a&&/INPUT|TEXTAREA|SELECT/.test(a.tagName))return;render()}
function subscribe(){if(ch)return;ch=sb.channel('rt')
 .on('postgres_changes',{event:'INSERT',schema:'public',table:'notifications',filter:'user_id=eq.'+UID},p=>{toast('🔔 '+nm(p.new));refresh()})
 .on('postgres_changes',{event:'*',schema:'public',table:'courses'},refresh).on('postgres_changes',{event:'*',schema:'public',table:'sessions'},refresh).on('postgres_changes',{event:'*',schema:'public',table:'live_participants'},refresh).subscribe()}
async function boot(){const {data}=await sb.auth.getSession();UID=data.session?data.session.user.id:null;
 if(UID){await loadAll();subscribe();if(nCount()&&!S.recovery)toast('🔔 '+t('unreadN',{n:nCount()}))}else await loadPub();render()}
sb.auth.onAuthStateChange(ev=>{if(ev==='PASSWORD_RECOVERY'){S.recovery=true;setTimeout(boot,0)}});

async function login(){const {error}=await sb.auth.signInWithPassword({email:v('em').trim(),password:v('pw')});
 if(error){S.err=t('bad');return render()}S.err='';S.tab=null;S.course=null;await boot()}
async function signup(){const n=v('nm').trim(),e=v('em').trim(),p=v('pw');
 if(!n||!e||p.length<6){S.err=t('needAll');return render()}
 const {error}=await sb.auth.signUp({email:e,password:p,options:{data:{name:n,level:v('lv')}}});
 if(error){S.err=error.message;return render()}S.mode='login';S.err='';S.ok=t('created');render()}
async function forgot(){const e=v('em').trim();if(!e){S.err=t('enterEmail');return render()}
 const {error}=await sb.auth.resetPasswordForEmail(e,{redirectTo:location.origin+location.pathname});
 if(error){S.err=error.message;return render()}S.err='';S.ok=t('resetSent');S.mode='login';render()}
async function savePw(rec){const p=v('np'),c=v('cp');if(p.length<6||p!==c)return alert(t('pwBad'));
 const {error}=await sb.auth.updateUser({password:p});if(error)return alert(error.message);toast(t('pwOk'));
 if(rec){S.recovery=false;history.replaceState(null,'',location.pathname);await boot()}else{document.getElementById('np').value='';document.getElementById('cp').value=''}}
const saveName=()=>{const n=v('pn').trim(),l=document.getElementById('pl');if(n){run(sb.from('profiles').update(l?{name:n,level:l.value}:{name:n}).eq('id',UID));toast(t('saved'))}};
async function logout(){await sb.auth.signOut();if(ch){sb.removeChannel(ch);ch=null}UID=null;me=null;S.course=null;S.mode='home';await loadPub();render()}
function go(x){S.tab=x;S.course=null;S.lesson=null;S.res='';render()}
function openC(id){S.course=id;S.lesson=null;S.res='';render()}
const openL=id=>{S.lesson=id;S.res='';render()};
const mode=m=>{S.mode=m;S.err='';S.ok='';render()};

const setRole=(id,r)=>run(sb.from('profiles').update({role:r}).eq('id',id));
function addCourse(){const x=v('ct').trim();if(!x)return;run(sb.from('courses').insert({title:x,lang:v('cl'),level:v('cv'),descr:v('cd').trim(),teacher:UID,price:Math.max(0,+v('cpr')||0),currency:v('ccur'),live_at:v('cdt')?new Date(v('cdt')).toISOString():null}))}
function delCourse(id){S.course=null;run(sb.from('courses').delete().eq('id',id))}
function addLesson(cid){const x=v('lt').trim();if(!x)return;const o=v('lo').split(',').map(a=>a.trim()).filter(Boolean);
 const l={course_id:cid,title:x,content:v('lc'),q:'',opts:[],a:0};
 if(v('lq').trim()&&o.length>1){l.q=v('lq').trim();l.opts=o;l.a=Math.min(Math.max((parseInt(v('la'))||1)-1,0),o.length-1)}run(sb.from('lessons').insert(l))}
function delLesson(id){S.lesson=null;run(sb.from('lessons').delete().eq('id',id))}
function addBook(cid){const x=v('bt').trim(),l=v('bl').trim();if(!x)return;if(!okUrl(l))return alert(t('urlErr'));run(sb.from('books').insert({course_id:cid,title:x,author:v('ba').trim(),link:l,descr:v('bd').trim()}))}
const delBook=id=>run(sb.from('books').delete().eq('id',id));
async function pay(cid){toast(t('payRedirect'));const {data,error}=await sb.functions.invoke('create-checkout',{body:{course_id:cid,return_url:location.origin+location.pathname}});
 if(error||!data||!data.url){alert(t('payErr'));return}location.href=data.url}
const enroll=cid=>{const c=cc(cid);if(c&&c.price>0)pay(cid);else run(sb.from('enrollments').insert({user_id:UID,course_id:cid}))};
const saveSched=cid=>{const d=v('sd');run(sb.from('courses').update({price:Math.max(0,+v('sp')||0),currency:v('scur'),live_at:d?new Date(d).toISOString():null}).eq('id',cid))};
const unlock=()=>run(sb.from('enrollments').upsert({user_id:v('us'),course_id:v('uc'),paid:true},{ignoreDuplicates:true}));
const finish=lid=>run(sb.from('progress').upsert({user_id:UID,lesson_id:lid}));
function answer(lid,i){const l=cc(S.course).lessons.find(x=>x.id===lid);if(i===l.a){S.res='ok';finish(lid)}else{S.res='ko';render()}}
function startLive(cid){const l=v('lk').trim();if(!okUrl(l))return alert(t('urlErr'));run(sb.rpc('start_live',{cid:cid,link:l,cap:parseInt(v('lcap'))||null}))}
async function stopLive(cid){const r=v('rp').trim();if(!okUrl(r))return alert(t('urlErr'));
 await sb.from('sessions').update({ended_at:new Date().toISOString(),replay:r||null}).eq('course_id',cid).is('ended_at',null);run(sb.from('courses').update({live:false}).eq('id',cid))}
function setReplay(id){const r=prompt(t('setReplay'));if(r===null)return;if(!okUrl(r.trim()))return alert(t('urlErr'));run(sb.from('sessions').update({replay:r.trim()||null}).eq('id',id))}
async function readN(id,cid){await sb.from('notifications').update({read:true}).eq('id',id);if(cid){S.course=cid;S.lesson=null;S.tab='my'}await loadAll();render()}
const readAll=()=>run(sb.from('notifications').update({read:true}).eq('read',false));

// ---------- Vues ----------
const money=c=>c.price>0?new Intl.NumberFormat(LC[LI],{style:'currency',currency:(c.currency||'eur').toUpperCase()}).format(c.price):t('free');
const info=c=>`<p class="price">${money(c)}</p>${c.live_at?`<p class="when">📅 ${dt(c.live_at)}</p>`:''}`;
const acc=c=>canEdit(c)||enrolled(c.id);
const low=p=>['A1','A2'].includes(p.level);
const curSel=(id,val,cb)=>`<select id="${id}" onchange="${cb}">${['eur','usd','zar','aed','sar'].map(k=>`<option value="${k}"${k===val?' selected':''}>${k.toUpperCase()} — ${t('cur_'+k)}</option>`).join('')}</select>`;
function preview(pi,ci,di){const p=+v(pi)||0,c=v(ci);document.getElementById(di).innerHTML=p>0?`<b>${t('beforePub')}</b><br>`+Object.keys(RATES).map(k=>`${k===c?'👉 ':'• '}${money({price:p/RATES[c]*RATES[k],currency:k})}${k===c?' ('+t('chosen')+')':''}`).join('<br>')+`<br><i>${t('rateNote')}</i>`:''}
const enrBlock=c=>{const ss=D.enr.filter(e=>e.course_id===c.id).map(e=>D.profiles.find(p=>p.id===e.user_id)).filter(Boolean);
 return `<div class="card"><h2 style="margin-top:0">👥 ${t('t_students')} (${ss.length})</h2>${ss.length?ss.map(p=>`<div class="row"><b>${esc(p.name)}</b><span class="badge">${p.level}${low(p)?' ⚠️':''}</span></div>`).join(''):`<p class="mu">${t('noStudents')}</p>`}</div>`};
const studentsView=()=>{const ss=D.profiles.filter(p=>p.role==='eleve');
 return `<div class="card"><h2 style="margin-top:0">${t('t_students')} (${ss.length})</h2>${ss.length?ss.map(p=>{const cs=D.enr.filter(e=>e.user_id===p.id).map(e=>cc(e.course_id)).filter(Boolean);return `<div class="row"><span><b>${esc(p.name)}</b> <span class="badge">${t('lv_'+p.level)}${low(p)?' ⚠️':''}</span><br><span class="mu">${cs.length?cs.map(c=>esc(c.title)).join(' · '):'—'}</span></span></div>`}).join(''):`<p class="mu">${t('noStudents')}</p>`}</div>`};
const catFilter=()=>`<p><label>${t('level')}</label><select style="width:auto" onchange="S.lvl=this.value;render()"><option value="all">${t('allLevels')}</option>${LV.map(x=>`<option value="${x}"${S.lvl===x?' selected':''}>${t('lv_'+x)}</option>`).join('')}</select></p>`;
const teacherForm=()=>`<div class="card"><h2 style="margin-top:0">👩‍🏫 ${t('newTeacher')}</h2><p class="mu">${t('teacherHelp')}</p><label>${t('name')}</label><input id="tn"><label>${t('email')}</label><input id="te" type="email"><label>${t('pw')}</label><input id="tp" type="password"><button class="p" onclick="createTeacher()">${t('createTeacher')}</button></div>`;
async function createTeacher(){const n=v('tn').trim(),e=v('te').trim(),p=v('tp');if(!n||!e||p.length<6)return alert(t('needAll'));
 const {data,error}=await sb.functions.invoke('create-user',{body:{name:n,email:e,password:p}});
 if(error||(data&&data.error))return alert((data&&data.error)||error.message);toast(t('teacherOk'));await loadAll();render()}
const actS=c=>D.sess.find(z=>z.course_id===c.id&&!z.ended_at);
const liveLink=c=>{const x=actS(c),l=x&&D.links.find(q=>q.session_id===x.id);return l?l.link:null};
const toLocal=x=>{if(!x)return '';const d=new Date(x);d.setMinutes(d.getMinutes()-d.getTimezoneOffset());return d.toISOString().slice(0,16)};
const schedBlock=c=>`<div class="card"><h2 style="margin-top:0">${t('schedule')}</h2><label>${t('price')}</label><input id="sp" type="number" min="0" step="0.5" value="${c.price||0}" oninput="preview('sp','scur','sprev')"><label>${t('currency')}</label>${curSel('scur',c.currency||'eur',"preview('sp','scur','sprev')")}<div id="sprev" class="mu" style="margin:0 0 8px"></div><label>${t('liveAt')}</label><input id="sd" type="datetime-local" value="${toLocal(c.live_at)}"><button class="p" onclick="saveSched('${c.id}')">${t('save')}</button></div>`;
const payView=()=>`<div class="card"><h2 style="margin-top:0">${t('unlock')}</h2><p class="mu">${t('unlockHelp')}</p><select id="us">${D.profiles.filter(u=>u.role==='eleve').map(u=>`<option value="${u.id}">${esc(u.name)}</option>`).join('')}</select><select id="uc">${D.courses.map(c=>`<option value="${c.id}">${esc(c.title)}</option>`).join('')}</select><button class="p" onclick="unlock()">${t('unlock')}</button></div>
<div class="card"><h2 style="margin-top:0">${t('t_pay')}</h2>${D.pay.length?D.pay.map(x=>{const u=D.profiles.find(z=>z.id===x.user_id),c=cc(x.course_id);return `<div class="row"><span><b>${esc(u?u.name:'—')}</b> — ${esc(c?c.title:'—')}<br><span class="mu">${dt(x.created_at)}</span></span><span>${money({price:x.amount,currency:x.currency})} <span class="badge">${t('paid')}</span></span></div>`}).join(''):`<p class="mu">${t('noPay')}</p>`}</div>`;
const guestHeader=()=>`<header><h1>🎓 LinguaPlus</h1><span>${langSelect()} ${S.mode==='home'?`<button class="s" onclick="mode('login')">${t('login')}</button>`:`<button class="s" onclick="mode('home')">${t('back')}</button>`}</span></header>`;
function landCard(c){return `<div class="card">${c.live?`<span class="badge live">${t('badgeLive')}</span>`:''}<span class="badge">${c.lang==='EN'?'🇬🇧 '+t('en'):'🇫🇷 '+t('fr')}</span><span class="badge">${esc(c.level)}</span><h3>${esc(c.title)}</h3><p class="mu">${esc(c.descr)}</p>${info(c)}<button class="p s" onclick="mode('signup')">${c.price>0?t('payEnroll',{p:money(c)}):t('enroll')}</button></div>`}
function landing(){const up=D.pub.filter(c=>c.live_at&&new Date(c.live_at)>new Date()).sort((a,b)=>a.live_at<b.live_at?-1:1);
 return `<div class="nav"><b style="font-size:20px">🎓 LinguaPlus</b><span>${langSelect()} <button class="s" onclick="mode('login')">${t('login')}</button> <button class="s p" onclick="mode('signup')">${t('signup')}</button></span></div>
 <div class="hero2"><h1>${t('heroT')}</h1><p>${t('heroS')}</p><button class="w" onclick="mode('signup')">${t('signup')}</button> <button class="o" onclick="document.getElementById('forms').scrollIntoView({behavior:'smooth'})">${t('heroCta')}</button></div>
 <div class="trust"><span>🎯 ${t('levelsT')}</span><span>🔴 ${t('f1T')}</span><span>🔒 ${t('secureT')}</span></div>
 ${up.length?`<h2>📅 ${t('upcoming')}</h2><div class="grid">${up.slice(0,3).map(landCard).join('')}</div>`:''}
 <h2 id="forms">${t('ourForm')}</h2>${D.pub.length?`<div class="grid">${D.pub.map(landCard).join('')}</div>`:`<p class="mu">${t('noCourse')}</p>`}
 <div class="grid" style="margin-top:16px">${[['f1T','f1','🔴'],['f2T','f2','✅'],['f3T','f3','📚']].map(x=>`<div class="card"><h3>${x[2]} ${t(x[0])}</h3><p class="mu">${t(x[1])}</p></div>`).join('')}</div>
 <h2>${t('howT')}</h2><div class="grid">${['s1','s2','s3'].map(k=>`<div class="card">${t(k)}</div>`).join('')}</div>
 <div class="card" style="margin-top:16px;text-align:center"><b>🔒 ${t('secureT')}</b><p class="mu">${t('secure')}</p></div><footer>© LinguaPlus</footer>`}
function authView(){const m=S.mode,su=m==='signup',fg=m==='forgot';
 return guestHeader()+`<div class="card" style="max-width:380px;margin:20px auto"><h1>🎓 LinguaPlus</h1><p class="mu">${t('tagline')}</p>
 ${su?`<label>${t('name')}</label><input id="nm"><label>${t('lvlLbl')}</label><select id="lv">${LV.map(x=>`<option value="${x}">${t('lv_'+x)}</option>`).join('')}</select>`:''}<label>${t('email')}</label><input id="em" type="email" autocapitalize="none">${fg?'':`<label>${t('pw')}</label><input id="pw" type="password">`}
 ${S.err?`<p class="err">${esc(S.err)}</p>`:''}${S.ok?`<p class="ok">${esc(S.ok)}</p>`:''}
 <button class="p" style="width:100%" onclick="${su?'signup()':fg?'forgot()':'login()'}">${su?t('signupBtn'):fg?t('sendReset'):t('login')}</button>
 <p style="text-align:center">${m==='login'?`<button class="s" onclick="mode('forgot')">${t('forgot')}</button> `:''}<button class="s" onclick="mode('${m==='login'?'signup':'login'}')">${m==='login'?t('signup'):t('haveAcc')}</button></p></div>`}
const pwForm=rec=>`<label>${t('newPw')}</label><input id="np" type="password"><label>${t('confPw')}</label><input id="cp" type="password"><button class="p" onclick="savePw(${rec})">${t('save')}</button>`;
const recoveryView=()=>`<div class="card" style="max-width:380px;margin:40px auto"><h1>🎓 LinguaPlus</h1><h2>${t('resetTitle')}</h2>${pwForm(true)}</div>`;
const settings=()=>`<div class="card"><h2 style="margin-top:0">${t('profile')}</h2><label>${t('name')}</label><input id="pn" value="${esc(me.name)}">${me.role==='eleve'?`<label>${t('lvlLbl')}</label><select id="pl">${LV.map(x=>`<option value="${x}"${me.level===x?' selected':''}>${t('lv_'+x)}</option>`).join('')}</select>`:''}<button class="p" onclick="saveName()">${t('save')}</button></div>
 <div class="card"><h2 style="margin-top:0">${t('changePw')}</h2>${pwForm(false)}</div>
 <div class="card"><h2 style="margin-top:0">${t('langLbl')}</h2>${langSelect()}<p class="mu">${t('langNote')}</p></div>${me.role==='admin'?teacherForm():''}`;

function card(c,extra){const p=D.profiles.find(u=>u.id===c.teacher);
 return `<div class="card">${c.live?`<span class="badge live">${t('badgeLive')}</span>`:''}<span class="badge">${c.lang==='EN'?'🇬🇧 '+t('en'):'🇫🇷 '+t('fr')}</span><span class="badge">${esc(c.level)}</span><h3>${esc(c.title)}</h3><p class="mu">${esc(c.descr)}<br>${t('teacher')} : ${esc(p?p.name:'—')}${acc(c)?' · '+c.lessons.length+' '+t('lessonsN'):''}</p>${info(c)}${extra}</div>`}
const openBtn=c=>`<button class="p s" onclick="openC('${c.id}')">${t('open')}</button>`;
const delBtn=c=>` <button class="s d" onclick="delCourse('${c.id}')">${t('del')}</button>`;
const list=(cs,fn)=>cs.length?`<div class="grid">${cs.map(fn).join('')}</div>`:`<p class="mu">${t('noCourse')}</p>`;
function sessRows(ss,withCourse){return ss.map(s=>{const c=cc(s.course_id);return `<div class="row"><span>${withCourse?`<b>${esc(c.title)}</b><br>`:''}<span class="mu">${dt(s.started_at)}</span></span><span>${s.replay?`<a href="${esc(s.replay)}" target="_blank" rel="noopener"><button class="s p">${t('replay')}</button></a>`:`<span class="mu">${t('noReplay')}</span>`}${canEdit(c)?` <button class="s" onclick="setReplay('${s.id}')">${t('setReplay')}</button>`:''}</span></div>`}).join('')}
function home(){const live=D.courses.filter(c=>c.live&&vis(c)),ss=D.sess.filter(s=>s.ended_at&&cc(s.course_id)&&vis(cc(s.course_id)));
 return `<h2 style="margin-top:0">${t('welcome')}, ${esc(me.name)} 👋</h2>`+live.map(c=>`<div class="card live"><b>${esc(c.title)}</b> — ${t('liveNow')}<p>${joinBtn(c)} <button onclick="openC('${c.id}')">${t('open')}</button></p></div>`).join('')+
 `<div class="card"><h2 style="margin-top:0">🔁 ${t('replays')}</h2><p class="mu">${t('missed')}</p>${ss.length?sessRows(ss,true):`<p class="mu">${t('noSessions')}</p>`}</div>`}
function dash(){const n=r=>D.profiles.filter(u=>u.role===r).length;
 return `<div class="stats"><div class="card"><b>${n('eleve')}</b>${t('students')}</div><div class="card"><b>${n('prof')}</b>${t('teachers')}</div><div class="card"><b>${D.courses.length}</b>${t('t_courses')}</div><div class="card"><b>${D.enr.length}</b>${t('enrolments')}</div></div>`}
const users=()=>`<div class="card"><h2 style="margin-top:0">${t('t_users')}</h2><p class="mu">${t('usersHelp')}</p>`+D.profiles.map(u=>`<div class="row"><b>${esc(u.name)}</b><select style="width:auto;margin:0" ${u.id===UID?'disabled':''} onchange="setRole('${u.id}',this.value)">${['admin','prof','eleve'].map(r=>`<option value="${r}"${u.role===r?' selected':''}>${t('r_'+r)}</option>`).join('')}</select></div>`).join('')+'</div>';
const courseForm=()=>`<div class="card"><h2 style="margin-top:0">${t('newCourse')}</h2><label>${t('title')}</label><input id="ct"><label>${t('langTaught')}</label><select id="cl"><option value="EN">${t('en')}</option><option value="FR">${t('fr')}</option></select><label>${t('level')}</label><select id="cv"><option>A1</option><option>A2</option><option>B1</option><option>B2</option><option>C1</option></select><label>${t('desc')}</label><textarea id="cd" rows="2"></textarea><label>${t('price')}</label><input id="cpr" type="number" min="0" step="0.5" value="0" oninput="preview('cpr','ccur','cprev')"><label>${t('currency')}</label>${curSel('ccur','eur',"preview('cpr','ccur','cprev')")}<div id="cprev" class="mu" style="margin:0 0 8px"></div><label>${t('liveAt')}</label><input id="cdt" type="datetime-local"><button class="p" onclick="addCourse()">${t('create')}</button></div>`;
function notifView(){let h=`<div class="card"><div class="row" style="padding-top:0"><h2 style="margin:0">${t('t_notif')}</h2>${nCount()?`<button class="s" onclick="readAll()">${t('markAll')}</button>`:''}</div>`;
 if(!D.notifs.length)h+=`<p class="mu">${t('noNotif')}</p>`;
 D.notifs.forEach(n=>{h+=`<div class="row ${n.read?'':'unread'}"><span>${n.read?'':'<b>'}${esc(nm(n))}${n.read?'':'</b>'}<br><span class="mu">${dt(n.created_at)}</span></span>${cc(n.course_id)?`<button class="s p" onclick="readN('${n.id}','${n.course_id}')">${t('open')}</button>`:''}</div>`});return h+'</div>'}
function joinBtn(c){const x=actS(c);if(!x)return '';
 if(canEdit(c)){const l=liveLink(c);return l?`<a href="${esc(l)}" target="_blank" rel="noopener"><button class="p">${t('join')}</button></a>`:''}
 const mp=D.parts.find(p=>p.session_id===x.id&&p.user_id===UID);
 if(mp&&mp.status==='kicked')return `<p class="err">${t('kickedMsg')}</p>`;
 const l=S.jl[c.id];
 return (l?`<a href="${esc(l)}" target="_blank" rel="noopener"><button class="p">${t('openLink')}</button></a> `:`<button class="p" onclick="joinLive('${c.id}')">${t('join')}</button> `)+(mp?`<button class="s" onclick="leaveLive('${x.id}')">${t('leaveLive')}</button>`:'')}
async function joinLive(cid){const {data,error}=await sb.rpc('join_live',{cid:cid});
 if(error){const m=error.message||'';alert(m.includes('FULL')?t('liveFull'):m.includes('KICKED')?t('kickedMsg'):m.includes('NOT_ENROLLED')?t('locked'):t('liveOver'));await loadAll();return render()}
 if(!data){alert(t('noLink'));await loadAll();return render()}
 S.jl[cid]=data;window.open(data,'_blank','noopener');await loadAll();render()}
async function leaveLive(sid){S.jl={};await run(sb.rpc('leave_live',{sid:sid}))}
async function kick(sid,u){await run(sb.rpc('kick_live',{sid:sid,uid:u}));toast(t('zoomNote'))}
const readmit=(sid,u)=>run(sb.rpc('readmit_live',{sid:sid,uid:u}));
const setCap=sid=>run(sb.from('sessions').update({capacity:parseInt(v('cap2'))||null}).eq('id',sid));
function liveBlock(c,edit){const x=actS(c);
 if(c.live&&x){let h=`<div class="card live"><b>${t('liveNow')}</b>${x.capacity?`<p class="mu">${t('capInfo',{n:x.capacity})}</p>`:''}`;
  if(edit){const ps=D.parts.filter(p=>p.session_id===x.id),inn=ps.filter(p=>p.status==='in'),out=ps.filter(p=>p.status==='kicked'),who=p=>{const u=D.profiles.find(q=>q.id===p.user_id);return u?esc(u.name):'—'};
   h+=(liveLink(c)?`<p><a href="${esc(liveLink(c))}" target="_blank" rel="noopener"><button class="p">${t('openLink')}</button></a></p>`:`<p class="mu">${t('noLink')}</p>`)
   +`<h3>${t('inLive')} (${inn.length}${x.capacity?'/'+x.capacity:''}) <span class="mu">· ${t('teacherOnly')}</span></h3>`
   +inn.map(p=>`<div class="row"><b>${who(p)}</b><button class="s d" onclick="kick('${x.id}','${p.user_id}')">${t('kick')}</button></div>`).join('')
   +(out.length?`<h3>${t('kickedL')}</h3>`+out.map(p=>`<div class="row"><span>${who(p)}</span><button class="s" onclick="readmit('${x.id}','${p.user_id}')">${t('readmit')}</button></div>`).join(''):'')
   +`<label>${t('capLbl')}</label><input id="cap2" type="number" min="1" value="${x.capacity||''}"><button class="s" onclick="setCap('${x.id}')">${t('save')}</button><label>${t('replayLbl')}</label><input id="rp" placeholder="https://…"><button class="d" onclick="stopLive('${c.id}')">${t('endLive')}</button>`}
  else h+=joinBtn(c);
  return h+'</div>'}
 if(!edit)return '';const n=D.enr.filter(e=>e.course_id===c.id).length;
 return `<div class="card"><h2 style="margin-top:0">${t('liveTitle')}</h2><label>${t('visioLbl')}</label><input id="lk" placeholder="https://…"><label>${t('capLbl')}</label><input id="lcap" type="number" min="1"><button class="p" onclick="startLive('${c.id}')">${t('startLive')}</button><p class="mu">${t('notifyN',{n:n})}</p></div>`}
function booksBlock(c,edit){const b=c.books;if(!b.length&&!edit)return '';
 let h=`<div class="card"><h2 style="margin-top:0">📚 ${t('books')}</h2>`;if(!b.length)h+=`<p class="mu">${t('noBook')}</p>`;
 b.forEach(k=>{h+=`<div class="row"><span><b>${esc(k.title)}</b>${k.author?` <span class="mu">— ${esc(k.author)}</span>`:''}${k.descr?`<br><span class="mu">${esc(k.descr)}</span>`:''}</span><span>${k.link?`<a href="${esc(k.link)}" target="_blank" rel="noopener"><button class="s p">${t('read')}</button></a> `:''}${edit?`<button class="s d" onclick="delBook('${k.id}')">${t('del')}</button>`:''}</span></div>`});
 if(edit)h+=`<h3 style="margin-top:16px">${t('addBook')}</h3><label>${t('title')}</label><input id="bt"><label>${t('author')}</label><input id="ba"><label>${t('linkOpt')}</label><input id="bl" placeholder="https://…"><label>${t('desc')}</label><textarea id="bd" rows="2"></textarea><button class="p" onclick="addBook('${c.id}')">${t('addBookBtn')}</button>`;
 return h+'</div>'}
function courseView(c){const edit=canEdit(c),stu=me.role==='eleve';
 let h=`<button onclick="S.course=null;render()">${t('back')}</button><div class="card" style="margin-top:12px"><span class="badge">${c.lang==='EN'?'🇬🇧 '+t('en'):'🇫🇷 '+t('fr')}</span><span class="badge">${esc(c.level)}</span><h2 style="margin:8px 0">${esc(c.title)}</h2><p class="mu">${esc(c.descr)}</p>${info(c)}`;
 if(stu){if(!enrolled(c.id))return h+`<button class="p" onclick="enroll('${c.id}')">${c.price>0?t('payEnroll',{p:money(c)}):t('enroll')}</button><p class="mu">🔒 ${t('locked')}</p></div>`;h+=`<div class="bar"><i style="width:${pct(c)}%"></i></div><span class="mu">${t('progress')} : ${pct(c)} %</span>`}
 h+=`</div>${liveBlock(c,edit)}${edit?schedBlock(c)+enrBlock(c):''}`;
 const ss=D.sess.filter(s=>s.course_id===c.id&&s.ended_at);if(ss.length)h+=`<div class="card"><h2 style="margin-top:0">🔁 ${t('replays')}</h2>${sessRows(ss,false)}</div>`;
 h+=`<div class="card"><h2 style="margin-top:0">${t('lessons')}</h2>`;if(!c.lessons.length)h+=`<p class="mu">${t('noLesson')}</p>`;
 c.lessons.forEach((l,i)=>{h+=`<div class="row"><button class="${S.lesson===l.id?'on':''}" onclick="openL('${l.id}')">${stu&&done(l.id)?'✅ ':''}${i+1}. ${esc(l.title)}</button>${edit?`<button class="s d" onclick="delLesson('${l.id}')">${t('del')}</button>`:''}</div>`});
 h+='</div>';const l=c.lessons.find(x=>x.id===S.lesson);
 if(l){h+=`<div class="card"><h2 style="margin-top:0">${esc(l.title)}</h2><div class="lec">${esc(l.content)}</div>`;const o=l.opts||[];
  if(l.q){h+=`<h3 style="margin-top:16px">${t('quiz')}</h3><p>${esc(l.q)}</p>`;
   if(stu){o.forEach((x,i)=>{h+=`<button class="opt" onclick="answer('${l.id}',${i})">${esc(x)}</button>`});if(S.res==='ok')h+=`<p class="ok">${t('right')}</p>`;if(S.res==='ko')h+=`<p class="err">${t('wrong')}</p>`}
   else h+=`<p class="mu">${t('choices')} : ${o.map(esc).join(' · ')} — ${t('answer')} : <b>${esc(o[l.a])}</b></p>`}
  else if(stu&&!done(l.id))h+=`<button class="p" onclick="finish('${l.id}')">${t('markDone')}</button>`;h+='</div>'}
 h+=booksBlock(c,edit);
 if(edit)h+=`<div class="card"><h2 style="margin-top:0">${t('addLesson')}</h2><label>${t('title')}</label><input id="lt"><label>${t('content')}</label><textarea id="lc" rows="4"></textarea><label>${t('quizQ')}</label><input id="lq"><label>${t('optsLbl')}</label><input id="lo"><label>${t('goodN')}</label><input id="la" type="number" min="1" value="1"><button class="p" onclick="addLesson('${c.id}')">${t('addLessonBtn')}</button></div>`;
 return h}

function render(){applyLang();const app=document.getElementById('app');
 if(S.recovery){app.innerHTML=recoveryView();return}
 if(!UID){app.innerHTML=S.mode==='home'?landing():authView();return}
 if(!me){app.innerHTML=`<p class="err" style="text-align:center">${t('noProfile')}</p><p style="text-align:center"><button onclick="logout()">${t('logout')}</button></p>`;return}
 const tabs=TABS[me.role];if(!S.tab||!tabs.includes(S.tab))S.tab=tabs[0];
 let h=`<header><h1>🎓 LinguaPlus</h1><span>${langSelect()} <span class="badge">${t('r_'+me.role)}</span> ${esc(me.name)} <button class="s" onclick="logout()">${t('logout')}</button></span></header><nav>${tabs.map(x=>`<button class="${S.tab===x?'on':''}" onclick="go('${x}')">${t('t_'+x)}${x==='notif'&&nCount()?' ('+nCount()+')':''}</button>`).join('')}</nav>`;
 if(S.err)h+=`<p class="err">${esc(S.err)}</p>`;
 const c=S.course&&cc(S.course);
 if(c)h+=courseView(c);
 else if(S.tab==='home')h+=home();
 else if(S.tab==='dash')h+=dash();
 else if(S.tab==='users')h+=users();
 else if(S.tab==='settings')h+=settings();
 else if(S.tab==='courses')h+=list(D.courses,x=>card(x,openBtn(x)+delBtn(x)));
 else if(S.tab==='mine')h+=courseForm()+`<h2>${t('t_mine')}</h2>`+list(D.courses.filter(x=>x.teacher===UID),x=>card(x,openBtn(x)+delBtn(x)));
 else if(S.tab==='students')h+=studentsView();
 else if(S.tab==='pay')h+=payView();
 else if(S.tab==='notif')h+=notifView();
 else if(S.tab==='cat')h+=catFilter()+list(D.courses.filter(x=>!S.lvl||S.lvl==='all'||x.level===S.lvl),x=>card(x,enrolled(x.id)?openBtn(x):`<button class="s p" onclick="enroll('${x.id}')">${x.price>0?t('payEnroll',{p:money(x)}):t('enroll')}</button>`));
 else if(S.tab==='my')h+=list(D.courses.filter(x=>enrolled(x.id)),x=>card(x,`<div class="bar"><i style="width:${pct(x)}%"></i></div><span class="mu">${pct(x)} %</span><br>${openBtn(x)}`));
 app.innerHTML=h}
boot();
