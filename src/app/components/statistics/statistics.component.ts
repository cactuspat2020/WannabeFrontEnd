import { Component, OnInit } from '@angular/core';
import { StatisticsService } from '../../services/statistics.service';
import { WannabeDAOService } from '../../services/wannabe-dao.service';
import { Ranking } from '../../services/statistics.service';
import { PlayersRemaining } from '../../services/statistics.service';
import { Chart } from 'chart.js/auto'
import { OwnerRecord } from '../../models/ownerRecord';
import { ChartConfiguration, ChartType } from 'chart.js';


@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.css']
})
export class StatisticsComponent implements OnInit {
  statasticsService: StatisticsService;
  wannabeDAO: WannabeDAOService;
  ranking: Ranking[];
  myBarChart: Chart;
  teams: OwnerRecord[];
  spiderTeamSelection = 'all';
  spiderData: Map<string, Map<string, number>>;

  playerMap: Map<string, PlayersRemaining>;
  playerMapKeys;

  dataLoaded = true;
  startersOnly = false;
  startersOnlySelection;

  public barChartData: ChartConfiguration<'bar'>['data'];
  public barChartLegend = true;
  public barChartPlugins = [];
  public barChartOptions: ChartConfiguration<'bar'>['options'] = {
    indexAxis: 'y',
    responsive: true
  };

  public radarChartType: ChartType = 'radar';
  public radarChartData: ChartConfiguration<'radar'>['data'];
  public radarChartLabels = [];
  public radarChartOptions: ChartConfiguration['options'] = {
    responsive: true,
     scales: {
        r: {
            suggestedMax: 1.2,
            suggestedMin: 0,
            ticks: {
                stepSize: 0.2
            }
        }
    }
  };

  constructor(stasticsService: StatisticsService, wannabe: WannabeDAOService) {
    this.statasticsService = stasticsService;
    this.wannabeDAO = wannabe;
  }

  ngOnInit() {
    this.wannabeDAO.fetchTeams().subscribe((teamList: OwnerRecord[]) => {
      this.teams = teamList;
    });

    this.statasticsService.getRemainingByStatus().subscribe((remainingPlayers: Map<string, PlayersRemaining>) => {
      this.playerMap = remainingPlayers;
      this.playerMapKeys = Array.from(remainingPlayers.keys());
    });

    this.statasticsService.getPowerRankings(this.startersOnly).subscribe((draftData: Ranking[]) => {
      const barChart = this.buildPowerRankingChart(draftData);
    });

    this.statasticsService.getSpiderData(this.startersOnly).subscribe((spiderData: Map<string, Map<string, number>>) => {
      this.spiderData = spiderData;
      const spiderChart = this.buildSpiderChart(this.wannabeDAO.getDraftOwner(), spiderData);
    });
    this.wannabeDAO.storeAuditRecord('Statistics');
  }

  refresh() {
    this.ngOnInit();
  }

  setStatScope() {
    this.startersOnly = this.startersOnlySelection === 'true';
    this.statasticsService.getPowerRankings(this.startersOnly).subscribe((draftData: Ranking[]) => {
      this.buildPowerRankingChart(draftData);
    });

    this.statasticsService.getSpiderData(this.startersOnly).subscribe((spiderData: Map<string, Map<string, number>>) => {
      this.spiderData = spiderData;
      const spiderChart = this.buildSpiderChart(this.wannabeDAO.getDraftOwner(), spiderData);
    });
  }

  selectPlayers() {
    if (this.spiderTeamSelection !== 'all') {
      this.buildSpiderChart(this.spiderTeamSelection, this.spiderData);
    }
  }

  /************************************/
  // Build the Power Ranking Chart chart
  /************************************/
  buildPowerRankingChart(draftData: Ranking[]) {
    const teamNames = [];
    const projections = [];
    draftData.map(x => teamNames.push(x.teamName));
    draftData.map(x => projections.push(x.fantasyPoints));

    const ctx = document.getElementById('barChart') as HTMLCanvasElement;

    this.barChartData = {
      labels: teamNames,
      datasets: [{
        data: projections,
        backgroundColor: [
          'rgba(255, 0, 0, 0.2)',
          'rgba(0, 255, 0, 0.2)',
          'rgba(0, 0, 255, 0.2)',
          'rgba(255, 255, 0, 0.2)',
          'rgba(255, 0, 255, 0.2)',
          'rgba(0, 255, 255, 0.2)',
          'rgba(128, 0, 0, 0.2)',
          'rgba(0, 128, 0, 0.2)',
          'rgba(0, 0, 128, 0.2)',
          'rgba(128, 128, 0, 0.2)',
          'rgba(128, 0, 128, 0.2)',
          'rgba(0, 128, 128, 0.2)'
        ],
        borderColor: [
          'rgba(255, 0, 0, 1)',
          'rgba(0, 255, 0, 1)',
          'rgba(0, 0, 255, 1)',
          'rgba(255, 255, 0, 1)',
          'rgba(255, 0, 255, 1)',
          'rgba(0, 255, 255, 1)',
          'rgba(128, 0, 0, 1)',
          'rgba(0, 128, 0, 1)',
          'rgba(0, 0, 128, 1)',
          'rgba(128, 128, 0, 1)',
          'rgba(128, 0, 128, 1)',
          'rgba(0, 128, 128, 1)'
        ],
        borderWidth: 1
      }]
    }
  }

  /************************************/
  // Build the Spider chart
  /************************************/
  buildSpiderChart(team: string, spiderData: Map<string, Map<string, number>>) {
    const averages = spiderData.get('averages');
    const teamData = spiderData.get(team);

    this.radarChartData = 
       {
        labels: ['QB', 'RB', 'Rec', 'DST', 'K'],
        datasets: [{
          data: Array.from(averages.values()),
          // data: [2, 3, 2.5, 2, 3],
          backgroundColor: [ 'rgba(255, 0, 0, 0.2)' ],
          borderColor: [ 'rgba(255, 0, 0, 1)' ],
          borderWidth: 1,
          label: 'Average'
        }, {
          // labels: Array.from(teamData.values()) ,
          data: Array.from(teamData.values()),
          // data: [3, 2, 1.5, 2, 3.5],
          backgroundColor: [ 'rgba(0, 255, 0, 0.2)' ],
          borderColor: [ 'rgba(0, 0, 255, 1)' ],
          borderWidth: 1,
          label: team
        }
      ]
      }
  }

}