---
layout: post
url: "/common/2016/05/27/les-logs-symfony.html"
title: "Les logs symfony"
author: "Morched MHEDEB"
date: 2016-05-27 14:00:00 +0100
pitch: "Cet article permet de présenter l'utlisation des logs dans symfony"
comments: True
categories: common
---

La journalisation (logging en anglais) est une technique qui accompagne une application aussi bien durant la phase de développement qu’après sa mise en production. Elle consiste à enregistrer dans un journal (généralement matérialisé par un fichier) des logs (événements) qui sont déclenchés par l’application.

# Les logs dans Symfony 1.x

## Configurer les fichiers de log

Vous pouvez trouver tous les logs de symfony sous le répertoire myproject / log / répertoire . Il existe un fichier par application et par l'environnement . Par exemple , le fichier journal de l'environnement de développement de l'application frontend est nommé frontend_dev.log , la production est nommé frontend_prod.log , et ainsi de suite.

Le format des fichiers de log est configurable en remplaçant la forme et / ou les paramètres de TIME_FORMAT dans factories.yml

        all:
          logger:
            param:
              sf_file_debug:
                param:
                  format:      %time% %type% [%priority%] %message%%EOL%
                  time_format: %b %d %H:%M:%S

Nous pouvons aussi modifier le level de l'erreur. il existe 8 levels emerg, alert, crit, err, warning, notice, info et debug qui sont les même que PEAR::Log package (http://pear.php.net/package/Log/) levels 

        prod:
          logger:
            param:
              level: err
              
Par défaut, dans tous les environnements sauf l'environnement de production , tous les messages sont enregistrés ( jusqu'au niveau moins important , le niveau de débogage ) .


        Pour voir si logging est activée, appeler sfConfig::get('sf_logging_enabled').
        
## Logger a partir l'application

pour logger depuis l'application SF 1.X il suffit

        // From an action
        $this->logMessage($message, $level);
         
        // From a template
        <?php use_helper('Debug') ?>
        <?php log_message($message, $level) ?>
        
        // depuis n'importe quel endroit du code
        if (sfConfig::get('sf_logging_enabled'))
        {
          sfContext::getInstance()->getLogger()->info($message);
        }
        
$level correspond au level du log voulu

## Customizer les logs


Le système de log de Symfony est très simple, mais il est également facile à personnaliser.

La seule condition est que les classes de logs doivent étendre la classe sfLogger , qui définit une méthode dolog ( ) . Symfony appelle la méthode dolog ( ) avec deux paramètres : $message ( le message à être connecté ) , et $priorité (le niveau de journal ) .

        class myLogger extends sfLogger
        {
          protected function doLog($message, $priority)
          {
            error_log(sprintf('%s (%s)', $message, sfLogger::getPriorityName($priority)));
          }
        }
        
## Maintenance des fichiers de logs

Pour vider les fichiers des logs

        > php symfony log:clear
        
Pour la rotaion des fichier de log

        > php symfony log:rotate frontend prod --period=7 --history=10
        

# Monolog Pour du Symfony 2.x

Monolog est une librairie capable non seulement d’enregistrer les logs dans un fichier de journalisation, mais également de les envoyer par e-mail, avec le protocole syslog ou même de les stocker en base de données.
Monolog est compatible avec le standard PSR-3 du groupe php-fig. Il met donc à votre disposition un objet de journalisation qui implémente l’interface Psr\Log\LoggerInterface.
Comme pour symfony 1.x il y a 8 levels de logs.
Le bundle MonologBundle doit être utilisé pour intégrer Monolog dans un projet Symfony.
Il est installé par défaut dans l’édition standard du framework. Vérifiez tout de même que vous utilisez bien au minimum la version 2.5. La ligne de dépendance du paquet devrait être comme cela :

        { 
            "require": { 
                ... 
                "symfony/monolog-bundle": "~2.5" 
            } 
        }
        
## Le service logger

Le service de journalisation par défaut s’appelle logger, comme nous l’avons précisé précédemment, Monolog supporte le standard PSR-3, ce service implémente donc l’interface Psr\Log\LoggerInterface.
Exemple :

        $this->get(’logger’)->warning(’Houston, on a eu un problème.’);
        
Par défaut, ce log sera enregistré dans un fichier : app/logs/prod.log ou app/logs/dev.log (selon votre environnement).

## Les gestionnaires (handlers)

Un handler (gestionnaire en français) est un service qui traite les logs déclenchés par l’application.
Par défaut, l’édition standard de Symfony configure un seul handler :

        // app/config/config_dev.yml 
        monolog: 
            handlers: 
                main: 
                    type:  stream 
                    path:  %kernel.logs_dir%/%kernel.environment%.log 
                    level: debug
                    
L’handler main est de type stream (flux). En PHP, le terme générique de flux désigne une ressource, cela correspond généralement à un fichier local.

La directive path indique le chemin vers la ressource, tandis que la directive level spécifie le niveau de gravité minimum pour lequel le handler devra être invoqué.

En clair, avec cette configuration, tous les logs dont le niveau est supérieur ou égal à debug seront enregistrés dans le fichier app/logs/dev.log. Les logs de niveau info sont donc ignorés.

### Définir plusieurs gestionnaires

        monolog: 
            handlers: 
                important: 
                    type:  stream 
                    path:  %kernel.logs_dir%/important.log 
                    level: error 
                    bubble: false 
                secondaire: 
                    type:  stream 
                    path:  %kernel.logs_dir%/secondaire.log 
                    level: debug
                    
Ici, nous en définissons deux : important et secondaire. Avec cette configuration, les logs seront répartis en deux fichiers, important.log contiendra les enregistrements de niveaux ERROR et supérieur, tandis que secondaire.log contiendra les autres enregistrements (niveau inférieur à ERROR).

L’option bubble mise à false sur le premier handler indique qu’une fois un enregistrement traité, il ne doit pas être envoyé aux handlers suivants : l’ordre dans lequel les handlers sont définis est donc important.

### Envoyer des logs par e-mail

Le handler swift_mailer est capable d’envoyer des e-mails avec la libraire SwiftMailer, intégrée par défaut à Symfony.
Cet handler est tout à fait adapté aux enregistrements de niveaux CRITICAL et supérieur, voici comment le configurer :

        monolog: 
            handlers: 
                swift: 
                    type:       swift_mailer 
                    from_email: rapport@mon-projet.local 
                    to_email:   developpeurs@mon-projet.local 
                    subject:    Rapport d’erreur 
                    level:      critical

Ici, les logs de niveaux CRITICAL et supérieur seront envoyés dans des messages, à l’adresse developpeurs@mon-projet.local.      

### Utiliser un tampon (buffer)

Le handler swift_mailer que nous venons de configurer n’est pas optimal, si plusieurs erreurs critiques surviennent au cours d’une même requête, vous recevrez autant d’e-mails.
Il est possible de regrouper les enregistrements d’une requête au sein du même message grâce à un tampon (buffer en anglais) :

        monolog: 
            handlers: 
                buffer: 
                    type:    buffer 
                    handler: swift 
                    level:   critical  
                swift: 
                    type:       swift_mailer 
                    from_email: rapport@mon-projet.local 
                    to_email:   developpeurs@mon-projet.local 
                    subject:    Rapport d’erreur

Avec cette configuration, le handler buffer englobe le handler swift, qui n’existe plus de lui-même, il n’a donc pas besoin de niveau. Le handler buffer récupérera les enregistrements de niveaux CRITICAL et supérieur, mais ne les transférera au handler swift qu’en fin de script. Ainsi, si plusieurs enregistrements sont récupérés, ils seront regroupés en un seul e-mail.

## Les canaux (channels)

Durant tous nos précédents exemples, nous avons expliqué comment Monolog pouvait répartir les logs différemment selon leur niveau de gravité.

Il existe un deuxième critère très utile que nous n’avons pas abordé jusqu’à présent : la source. En effet, selon la source d’un enregistrement, vous ne voudrez peut-être pas utiliser le même handler. À titre d’exemple, nous pourrions imaginer que les erreurs relatives à la base de données pourraient être traitées par un handler particulier, destiné à avertir l’administrateur de la base de données, plutôt qu’être mélangées avec les autres erreurs.

C’est dans le but d’offrir cette fonctionnalité que Monlog intègre des canaux. Par défaut, les enregistrements que vous déclenchez avec le service logger transitent par le canal app. Mais il en existe d’autres :

- doctrine : pour les enregistrements en rapport avec la base de données.
- security : pour les enregistrements en provenance du composant Security.
- emergency : pour les erreurs fatales.
- request : pour les enregistrements en rapport avec la requête et son routage.
....

### Ajouter ses propres canaux

Si vous avez une « sous-application » ou une intégration avec un service externe comme une API HTTP, vous souhaiterez peut-être isoler leurs enregistrements.
Pour cela, vous devrez ajouter vos propres canaux :

        // app/config/config.yml 
        monolog: 
            channels: ["mon_api", "mon_autre_cannal"]
            
  Ici, nous ajoutons deux canaux : mon_api et mon_autre_canal. Ils seront par défaut traités par tous vos handlers.
  
### Envoyer un enregistrement sur un canal donné
  
          // Canal « app » 
        $this->get(’logger’)->error(’Une erreur est survenue.’); 
        // Canal « mon_api » 
        $this 
            ->get(’monolog.logger.mon_api’) 
            ->critical(’Mon API ne répond pas.’) 
        ; 
        // Canal « doctrine » 
        $this 
            ->get(’monolog.logger.doctrine’) 
            ->debug(’Ma requête n\’a retourné aucun résultat.’) 
            
Comme vous l’aurez compris, pour envoyer les enregistrements sur un canal X, il suffit d’utiliser le service monolog.logger.X.

### Configurer les gestionnaires par canaux

Il n’y a pas d’intérêt à utiliser ses propres canaux si ce n’est pour les attacher à différents gestionnaires.
La directive channels est chargée d’effectuer cette tâche. Elle fonctionne soit par inclusion, soit par exclusion :

        monolog:  
            handlers:  
                api:  
                    type:     stream  
                    path:     %kernel.logs_dir%/mon_api.log  
                    channels: [mon_api]  
                principal:  
                    type:     stream  
                    path:     /%kernel.logs_dir%/enregistrements.log  
                    channels: [!mon_api, !doctrine]
                    
la gestions des canaux est très utile pour isoler les logs par application (Exemple de son utlisation pour les appels Salesforce vers ws qui sont isolées a part. Ca pourrais être utlisé aussi pour isoler les erreurs 404)

# Références

- [http://librosweb.es/libro/symfony_1_2_en/chapter_16/logging.html](http://librosweb.es/libro/symfony_1_2_en/chapter_16/logging.html)
- [http://symfony.com/doc/current/cookbook/logging/monolog.html](http://symfony.com/doc/current/cookbook/logging/monolog.html)
- [http://symfony.com/doc/current/reference/configuration/monolog.html](http://symfony.com/doc/current/reference/configuration/monolog.html)
- [http://symfony.com/doc/current/reference/configuration/monolog.html](http://symfony.com/doc/current/reference/configuration/monolog.html)

<blockquote>Morched MHEDEB</blockquote>
